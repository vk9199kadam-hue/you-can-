import { getFunctions, httpsCallable } from "firebase/functions";
import app from "./config";

export const functions = getFunctions(app);

export const fn = {
  createAcademyAndHead: httpsCallable(functions, "createAcademyAndHead"),
  bulkCreateUsers: httpsCallable(functions, "bulkCreateUsers"),
  resolveDoubt: httpsCallable(functions, "resolveDoubt"),
};

