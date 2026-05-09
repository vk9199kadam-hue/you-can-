"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateUsers = exports.createAcademyAndHead = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
(0, app_1.initializeApp)();
function requireAuth(request) {
    if (!request.auth?.uid)
        throw new https_1.HttpsError("unauthenticated", "Login required.");
    return request.auth.uid;
}
async function requireSuperAdmin(uid) {
    const db = (0, firestore_1.getFirestore)();
    const snap = await db.collection("users").doc(uid).get();
    const role = snap.data()?.role;
    if (role !== "super_admin")
        throw new https_1.HttpsError("permission-denied", "Super admin only.");
}
function normalizeCode(raw) {
    return raw.trim().toUpperCase().replace(/\s+/g, "");
}
function makeLoginEmail(academyId, userCode) {
    // Deterministic email to allow Firebase Auth password login using userCode.
    // Example: STU-ACAD01-0001@acad_abc123.youcan
    const safeAcademy = academyId.toLowerCase().replace(/[^a-z0-9-]/g, "");
    return `${normalizeCode(userCode)}@${safeAcademy}.youcan`;
}
function randomTempPassword() {
    // 12 chars, avoid ambiguous characters.
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#";
    let out = "";
    for (let i = 0; i < 12; i++)
        out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
}
exports.createAcademyAndHead = (0, https_1.onCall)(async (request) => {
    const callerUid = requireAuth(request);
    await requireSuperAdmin(callerUid);
    const data = request.data;
    const db = (0, firestore_1.getFirestore)();
    const academyRef = await db.collection("academies").add({
        ...data.academy,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    const userCode = `HEAD-${academyRef.id.slice(0, 6).toUpperCase()}-001`;
    const email = makeLoginEmail(academyRef.id, userCode);
    const tempPassword = randomTempPassword();
    const auth = (0, auth_1.getAuth)();
    const user = await auth.createUser({
        email,
        password: tempPassword,
        displayName: data.head.name,
    });
    await db.collection("users").doc(user.uid).set({
        uid: user.uid,
        email,
        userCode,
        name: data.head.name,
        role: "academy_head",
        academyId: academyRef.id,
        academyName: data.academy.name,
        phone: data.head.phone || "",
        status: "active",
        tempPassword: true,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    await academyRef.update({ headUserId: user.uid });
    return {
        academyId: academyRef.id,
        headUid: user.uid,
        headUserCode: userCode,
        headTempPassword: tempPassword,
        headLoginEmail: email
    };
});
exports.bulkCreateUsers = (0, https_1.onCall)(async (request) => {
    const callerUid = requireAuth(request);
    await requireSuperAdmin(callerUid);
    const data = request.data;
    const db = (0, firestore_1.getFirestore)();
    const auth = (0, auth_1.getAuth)();
    const created = [];
    let seq = 1;
    for (const r of data.rows) {
        const prefix = data.role === "teacher" ? "TCH" : "STU";
        const userCode = `${prefix}-${data.academyId.slice(0, 6).toUpperCase()}-${String(seq).padStart(4, "0")}`;
        seq++;
        const email = makeLoginEmail(data.academyId, userCode);
        const tempPassword = randomTempPassword();
        const user = await auth.createUser({
            email,
            password: tempPassword,
            displayName: r.name,
        });
        await db.collection("users").doc(user.uid).set({
            uid: user.uid,
            email,
            userCode,
            name: r.name,
            role: data.role,
            academyId: data.academyId,
            academyName: data.academyName,
            phone: r.phone || "",
            classLevel: r.classLevel || "",
            stream: r.stream || "",
            batch: r.batch || "",
            subject: r.subject || "",
            status: "active",
            tempPassword: true,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        created.push({ uid: user.uid, userCode, tempPassword, email, name: r.name });
    }
    return { count: created.length, created };
});
