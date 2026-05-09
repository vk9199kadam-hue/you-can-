import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();

type Role = "super_admin" | "academy_head" | "teacher" | "student";

function requireAuth(request: { auth?: { uid: string } }) {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Login required.");
  return request.auth.uid;
}

async function requireSuperAdmin(uid: string) {
  const db = getFirestore();
  const snap = await db.collection("users").doc(uid).get();
  const role = snap.data()?.role as Role | undefined;
  if (role !== "super_admin") throw new HttpsError("permission-denied", "Super admin only.");
}

function normalizeCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

function makeLoginEmail(academyId: string, userCode: string) {
  // Deterministic email to allow Firebase Auth password login using userCode.
  // Example: STU-ACAD01-0001@acad_abc123.youcan
  const safeAcademy = academyId.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return `${normalizeCode(userCode)}@${safeAcademy}.youcan`;
}

function randomTempPassword() {
  // 12 chars, avoid ambiguous characters.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#";
  let out = "";
  for (let i = 0; i < 12; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export const createAcademyAndHead = onCall(async (request) => {
  const callerUid = requireAuth(request);
  await requireSuperAdmin(callerUid);

  const data = request.data as {
    academy: {
      name: string;
      city: string;
      address: string;
      phone: string;
      email: string;
      streams: string[];
      classes: string[];
      plan: "free" | "basic" | "premium";
      status: "active" | "suspended" | "pending";
    };
    head: {
      name: string;
      phone?: string;
    };
  };

  const db = getFirestore();
  const academyRef = await db.collection("academies").add({
    ...data.academy,
    createdAt: FieldValue.serverTimestamp(),
  });

  const userCode = `HEAD-${academyRef.id.slice(0, 6).toUpperCase()}-001`;
  const email = makeLoginEmail(academyRef.id, userCode);
  const tempPassword = randomTempPassword();

  const auth = getAuth();
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
    createdAt: FieldValue.serverTimestamp(),
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

export const bulkCreateUsers = onCall(async (request) => {
  const callerUid = requireAuth(request);
  await requireSuperAdmin(callerUid);

  const data = request.data as {
    academyId: string;
    academyName: string;
    role: "teacher" | "student";
    rows: Array<{
      name: string;
      phone?: string;
      classLevel?: string;
      stream?: string;
      batch?: string;
      subject?: string;
    }>;
  };

  const db = getFirestore();
  const auth = getAuth();

  const created: Array<{ uid: string; userCode: string; tempPassword: string; email: string; name: string }> = [];
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
      createdAt: FieldValue.serverTimestamp(),
    });

    created.push({ uid: user.uid, userCode, tempPassword, email, name: r.name });
  }

  return { count: created.length, created };
});

