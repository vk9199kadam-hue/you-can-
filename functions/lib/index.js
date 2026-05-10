"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDoubt = exports.bulkCreateUsers = exports.createAcademyAndHead = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
(0, app_1.initializeApp)();
const openAiKey = (0, params_1.defineString)("OPENAI_API_KEY", { default: "" });
const cfApiToken = (0, params_1.defineString)("CLOUDFLARE_API_TOKEN", { default: "" });
const cfAccountId = (0, params_1.defineString)("CLOUDFLARE_ACCOUNT_ID", { default: "" });
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
async function requireStudent(uid) {
    const db = (0, firestore_1.getFirestore)();
    const snap = await db.collection("users").doc(uid).get();
    const role = snap.data()?.role;
    if (role !== "student")
        throw new https_1.HttpsError("permission-denied", "Students only.");
}
function tokenizeForMatch(s) {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9\u0900-\u097F]+/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);
}
function scoreQueryAgainstText(queryText, corpus) {
    const qt = new Set(tokenizeForMatch(queryText));
    if (qt.size === 0)
        return 0;
    let sc = 0;
    for (const w of tokenizeForMatch(corpus)) {
        if (qt.has(w))
            sc++;
    }
    return sc;
}
async function fetchRankedQuestionSnippets(db, academyId, subject, queryText, max) {
    const subj = subject?.trim() || "Physics";
    const snap = await db.collection("questions").where("subject", "==", subj).limit(100).get();
    const rows = [];
    snap.forEach((d) => rows.push({ id: d.id, data: d.data() }));
    const filtered = rows.filter((r) => {
        if (r.data.isShared === true)
            return true;
        if (academyId && r.data.academyId === academyId)
            return true;
        return false;
    });
    const pool = filtered.length > 0 ? filtered : rows;
    const scored = pool
        .map((r) => {
        const text = `${r.data.question ?? ""} ${r.data.topic ?? ""} ${r.data.chapter ?? ""}`;
        return {
            id: r.id,
            data: r.data,
            sc: scoreQueryAgainstText(queryText, text) + (r.data.isPYQ ? 0.5 : 0),
        };
    })
        .sort((a, b) => b.sc - a.sc);
    const hasSignal = scored.some((x) => x.sc > 0);
    const pick = (hasSignal ? scored : scored).slice(0, max);
    return pick.map((r) => {
        const q = r.data.question ?? "";
        return {
            id: r.id,
            preview: q.length > 140 ? `${q.slice(0, 137)}…` : q,
            snippet: q.length > 450 ? `${q.slice(0, 447)}…` : q,
        };
    });
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
exports.resolveDoubt = (0, https_1.onCall)(async (request) => {
    const uid = requireAuth(request);
    await requireStudent(uid);
    const { subject, query, language } = request.data;
    if (!query || !String(query).trim()) {
        throw new https_1.HttpsError("invalid-argument", "query is required");
    }
    const db = (0, firestore_1.getFirestore)();
    const userSnap = await db.collection("users").doc(uid).get();
    const academyId = userSnap.data()?.academyId;
    const qText = String(query).trim();
    const subj = subject?.trim() || "Physics";
    const lang = language === "mr" ? "mr" : "en";
    const related = await fetchRankedQuestionSnippets(db, academyId, subj, qText, 6);
    return {
        explanation: lang === "mr"
            ? "सध्या Live AI tutor बंद आहे. खाली तुमच्या प्रश्नाशी जुळणारे प्रश्न-bank snippets दिले आहेत. यावर आधारित पाठ्यपुस्तक (NCERT / eBalbharati) मधील संकल्पना वाचा आणि शिक्षकांना विचारून पूर्ण solution तपासा."
            : "Live AI tutor is currently disabled. Below are related question-bank snippets matched to your query. Use NCERT / eBalbharati to revise the concept and ask your teacher for a full worked solution.",
        relatedPyqs: related.map((r) => ({ id: r.id, preview: r.preview })),
        boardReference: "NCERT / eBalbharati (Maharashtra State Board)",
        stub: true,
    };
});
