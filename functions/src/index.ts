import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();

const openAiKey = defineString("OPENAI_API_KEY", { default: "" });

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

async function requireStudent(uid: string) {
  const db = getFirestore();
  const snap = await db.collection("users").doc(uid).get();
  const role = snap.data()?.role as Role | undefined;
  if (role !== "student") throw new HttpsError("permission-denied", "Students only.");
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

export const resolveDoubt = onCall(async (request) => {
  const uid = requireAuth(request);
  await requireStudent(uid);

  const { subject, query } = request.data as { subject?: string; query?: string };
  if (!query || !String(query).trim()) {
    throw new HttpsError("invalid-argument", "query is required");
  }

  const apiKey = openAiKey.value();
  if (!apiKey) {
    return {
      explanation:
        "AI is not configured yet. Set the OPENAI_API_KEY Firebase parameter for this function (see Firebase docs: environment parameters). Until then, use your class notes and textbook, or ask your teacher in the Doubts tab.",
      relatedPyqs: [] as string[],
      boardReference: "Maharashtra State Board / NCERT",
      stub: true,
    };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a concise tutor for Indian students preparing for MHT-CET, JEE Main, and NEET. Answer in clear steps. About 200–350 words. Reference board/syllabus context briefly when useful.",
        },
        {
          role: "user",
          content: `Subject: ${subject || "General"}\n\nStudent question:\n${query}`,
        },
      ],
      max_tokens: 700,
      temperature: 0.35,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("OpenAI HTTP error", res.status, errText);
    throw new HttpsError("internal", "AI service returned an error");
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const explanation = json.choices?.[0]?.message?.content?.trim() || "No explanation returned.";
  return {
    explanation,
    relatedPyqs: [] as string[],
    boardReference: "Verify key facts with NCERT / eBalbharati for your class.",
    stub: false,
  };
});

