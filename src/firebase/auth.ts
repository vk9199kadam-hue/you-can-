import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./config";
import type { UserProfile, UserRole } from "../types";

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(credential.user.uid);
  if (!profile) {
    throw new Error("User profile not found. Please contact your academy administrator.");
  }
  return profile;
}

export async function registerUser(
  email: string,
  password: string,
  profileData: {
    name: string;
    role: UserRole;
    academyId: string;
    academyName: string;
    subject?: string;
    classLevel?: string;
    stream?: string;
    batch?: string;
    phone?: string;
  }
): Promise<UserProfile> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const profile: UserProfile = {
    uid: credential.user.uid,
    email,
    name: profileData.name,
    role: profileData.role,
    academyId: profileData.academyId,
    academyName: profileData.academyName,
    subject: profileData.subject,
    classLevel: profileData.classLevel,
    stream: profileData.stream,
    batch: profileData.batch,
    phone: profileData.phone,
    status: "active",
    createdAt: new Date(),
  };
  await setDoc(doc(db, "users", credential.user.uid), {
    ...profile,
    createdAt: serverTimestamp(),
  });
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    uid: snap.id,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  } as UserProfile;
}

export function logoutUser(): Promise<void> {
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
