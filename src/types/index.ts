export type UserRole = "super_admin" | "academy_head" | "teacher" | "student";

export interface Academy {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  streams: string[];
  classes: string[];
  plan: "free" | "basic" | "premium";
  status: "active" | "suspended" | "pending";
  createdAt: Date;
  headUserId?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  academyId: string;
  academyName?: string;
  subject?: string;
  classLevel?: string;
  stream?: string;
  batch?: string;
  phone?: string;
  status: "active" | "inactive";
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  stream: string;
  classLevel: string;
  academyId: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  topics: string[];
}

export interface QuestionDoc {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  question: string;
  options: Record<string, string>;
  answer: string;
  explanation: string;
  difficulty: number;
  examType: string[];
  isPYQ: boolean;
  year?: number;
  academyId?: string;
}

export interface HomeworkAssignment {
  id: string;
  academyId: string;
  teacherId: string;
  teacherName: string;
  batch: string;
  classLevel: string;
  subject: string;
  chapter: string;
  topic?: string;
  questionIds: string[];
  questionCount: number;
  deadline: Date;
  timeLimit?: number;
  showSolutionsAfterDeadline: boolean;
  allowLateSubmission: boolean;
  status: "draft" | "published";
  createdAt: Date;
}

export interface HomeworkSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  academyId: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  submittedAt: Date;
  reviewed: boolean;
  teacherRemarks?: string;
}

export interface TestSession {
  id: string;
  studentId: string;
  academyId: string;
  subject: string;
  chapter: string;
  examMode: string;
  questions: string[];
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  completedAt: Date;
}

export interface Timetable {
  id: string;
  academyId: string;
  teacherId: string;
  classId: string;
  subject: string;
  month: number;
  year: number;
  status: "draft" | "published";
  createdAt: Date;
}

export interface ScheduleEntry {
  id: string;
  timetableId: string;
  date: string;
  chapterId: string;
  topicName: string;
  priorityLevel: "essential" | "recommended" | "optional";
  linkedHomeworkId?: string;
  linkedTestId?: string;
  status: "pending" | "completed" | "delayed";
  completionRate: number;
}

export interface DoubtSession {
  id: string;
  studentId: string;
  studentName: string;
  academyId: string;
  subject: string;
  chapter: string;
  topic: string;
  question: string;
  aiResponse?: string;
  teacherResponse?: string;
  teacherId?: string;
  status: "open" | "ai_resolved" | "teacher_resolved" | "closed";
  priority: "normal" | "urgent";
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  academyId: string;
  title: string;
  message: string;
  type: "homework" | "test" | "doubt" | "announcement" | "alert";
  read: boolean;
  createdAt: Date;
}
