import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Academy,
  UserProfile,
  HomeworkAssignment,
  HomeworkSubmission,
  TestSession,
  Timetable,
  ScheduleEntry,
  DoubtSession,
  QuestionDoc,
  MasterContent,
  AcademyContentAccess,
} from "../types";

// ---- Academies ----

export async function getAcademies(): Promise<Academy[]> {
  const snap = await getDocs(collection(db, "academies"));
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  })) as Academy[];
}

export async function getAcademy(id: string): Promise<Academy | null> {
  const snap = await getDoc(doc(db, "academies", id));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id, createdAt: snap.data().createdAt?.toDate?.() ?? new Date() } as Academy;
}

export async function createAcademy(data: Omit<Academy, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "academies"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAcademy(id: string, data: Partial<Academy>): Promise<void> {
  await updateDoc(doc(db, "academies", id), data as DocumentData);
}

// ---- Users ----

export async function getUsersByAcademy(academyId: string, role?: string): Promise<UserProfile[]> {
  const constraints: QueryConstraint[] = [where("academyId", "==", academyId)];
  if (role) constraints.push(where("role", "==", role));
  const q = query(collection(db, "users"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    uid: d.id,
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  })) as UserProfile[];
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({
    ...d.data(),
    uid: d.id,
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  })) as UserProfile[];
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, "users", uid), data as DocumentData);
}

// ---- Questions ----

export async function getQuestions(filters?: {
  subject?: string;
  chapter?: string;
  examType?: string;
  difficulty?: number;
  academyId?: string;
}): Promise<QuestionDoc[]> {
  const constraints: QueryConstraint[] = [];
  if (filters?.subject) constraints.push(where("subject", "==", filters.subject));
  if (filters?.chapter) constraints.push(where("chapter", "==", filters.chapter));
  if (filters?.difficulty) constraints.push(where("difficulty", "==", filters.difficulty));
  // Multi-tenant: show shared questions + academy questions.
  // NOTE: Firestore doesn't support OR queries well without extra indexing.
  // We keep it simple: caller can pass academyId to fetch academy-private questions,
  // and we always fetch shared questions in a second query.
  const q = constraints.length > 0
    ? query(collection(db, "questions"), ...constraints)
    : query(collection(db, "questions"));
  const snap = await getDocs(q);
  let results = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as QuestionDoc[];

  // If academyId is specified, also fetch shared questions and merge.
  // This avoids leaking other academies' private questions.
  if (filters?.academyId) {
    const sharedSnap = await getDocs(
      query(collection(db, "questions"), where("isShared", "==", true))
    );
    const shared = sharedSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as QuestionDoc[];
    const map = new Map<string, QuestionDoc>();
    for (const r of results) map.set(r.id, r);
    for (const r of shared) map.set(r.id, r);
    results = Array.from(map.values()).filter((qDoc) => {
      if (qDoc.isShared) return true;
      return qDoc.academyId === filters.academyId;
    });
  }

  return results;
}

export async function addQuestion(data: Omit<QuestionDoc, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "questions"), data);
  return ref.id;
}

export async function bulkAddQuestions(questions: Omit<QuestionDoc, "id">[]): Promise<number> {
  let count = 0;
  for (const q of questions) {
    await addDoc(collection(db, "questions"), q);
    count++;
  }
  return count;
}

// ---- Homework ----

export async function getHomeworkByAcademy(academyId: string): Promise<HomeworkAssignment[]> {
  const q = query(
    collection(db, "homework_assignments"),
    where("academyId", "==", academyId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    deadline: d.data().deadline?.toDate?.() ?? new Date(),
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  })) as HomeworkAssignment[];
}

export async function getHomeworkByTeacher(teacherId: string): Promise<HomeworkAssignment[]> {
  const q = query(
    collection(db, "homework_assignments"),
    where("teacherId", "==", teacherId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    deadline: d.data().deadline?.toDate?.() ?? new Date(),
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  })) as HomeworkAssignment[];
}

export async function createHomework(data: Omit<HomeworkAssignment, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "homework_assignments"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getSubmissions(assignmentId: string): Promise<HomeworkSubmission[]> {
  const q = query(
    collection(db, "homework_submissions"),
    where("assignmentId", "==", assignmentId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    submittedAt: d.data().submittedAt?.toDate?.() ?? new Date(),
  })) as HomeworkSubmission[];
}

export async function submitHomework(data: Omit<HomeworkSubmission, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "homework_submissions"), {
    ...data,
    submittedAt: serverTimestamp(),
  });
  return ref.id;
}

// ---- Test Sessions ----

export async function saveTestSession(data: Omit<TestSession, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "test_sessions"), {
    ...data,
    completedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getTestsByStudent(studentId: string): Promise<TestSession[]> {
  const q = query(
    collection(db, "test_sessions"),
    where("studentId", "==", studentId),
    orderBy("completedAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    completedAt: d.data().completedAt?.toDate?.() ?? new Date(),
  })) as TestSession[];
}

// ---- Timetables ----

export async function getTimetables(academyId: string, teacherId?: string): Promise<Timetable[]> {
  const constraints: QueryConstraint[] = [where("academyId", "==", academyId)];
  if (teacherId) constraints.push(where("teacherId", "==", teacherId));
  const q = query(collection(db, "timetables"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  })) as Timetable[];
}

export async function createTimetable(data: Omit<Timetable, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "timetables"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getScheduleEntries(timetableId: string): Promise<ScheduleEntry[]> {
  const q = query(
    collection(db, "schedule_entries"),
    where("timetableId", "==", timetableId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id })) as ScheduleEntry[];
}

export async function setScheduleEntry(id: string, data: Omit<ScheduleEntry, "id">): Promise<void> {
  await setDoc(doc(db, "schedule_entries", id), data);
}

// ---- Master Content + Access ----

export async function getMasterContent(): Promise<MasterContent[]> {
  const snap = await getDocs(query(collection(db, "master_content"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  })) as MasterContent[];
}

export async function addMasterContent(data: Omit<MasterContent, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "master_content"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getAcademyContentAccess(academyId: string): Promise<AcademyContentAccess[]> {
  const snap = await getDocs(
    query(collection(db, "academy_content_access"), where("academyId", "==", academyId))
  );
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  })) as AcademyContentAccess[];
}

export async function setAcademyContentAccess(data: Omit<AcademyContentAccess, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "academy_content_access"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

// ---- Doubts ----

export async function getDoubts(academyId: string, filters?: {
  studentId?: string;
  teacherId?: string;
  status?: string;
}): Promise<DoubtSession[]> {
  const constraints: QueryConstraint[] = [where("academyId", "==", academyId)];
  if (filters?.studentId) constraints.push(where("studentId", "==", filters.studentId));
  if (filters?.status) constraints.push(where("status", "==", filters.status));
  const q = query(collection(db, "doubt_sessions"), ...constraints, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  })) as DoubtSession[];
}

export async function createDoubt(data: Omit<DoubtSession, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "doubt_sessions"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDoubt(id: string, data: Partial<DoubtSession>): Promise<void> {
  await updateDoc(doc(db, "doubt_sessions", id), data as DocumentData);
}

// ---- Utility: Delete document ----

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, docId));
}
