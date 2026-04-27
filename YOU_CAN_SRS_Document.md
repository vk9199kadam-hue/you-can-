# YOU CAN - Multi-Academy Learning Platform
## Software Requirements Specification (SRS) Document

**Version:** 2.0  
**Date:** April 2026  
**Project:** YOU CAN - AI-Powered Maharashtra Learning Platform  
**Prepared by:** Antigravity AI  
**Live UI Preview:** https://you-can-ui-designs-lhlngqsi.devinapps.com

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Design System & UI Standards](#2-design-system--ui-standards)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Database Design (Single Database, Multi-Tenant)](#4-database-design)
5. [Row-Level Security (RLS) Rules](#5-row-level-security-rules)
6. [Login & Authentication Flow](#6-login--authentication-flow)
7. [Super Admin Panel — Complete Feature Spec](#7-super-admin-panel)
8. [Academy Head Panel — Complete Feature Spec](#8-academy-head-panel)
9. [Teacher Panel — Complete Feature Spec](#9-teacher-panel)
10. [Student Panel — Complete Feature Spec](#10-student-panel)
11. [Timetable & Scheduling System](#11-timetable--scheduling-system)
12. [AI Doubt Resolution Engine](#12-ai-doubt-resolution-engine)
13. [Notification System](#13-notification-system)
14. [Reporting & Export Engine](#14-reporting--export-engine)
15. [Content Pipeline & Data Ingestion](#15-content-pipeline--data-ingestion)
16. [Step-by-Step Working Flow (End to End)](#16-step-by-step-working-flow)
17. [Tech Stack & Architecture](#17-tech-stack--architecture)
18. [API Endpoints (Complete List)](#18-api-endpoints)
19. [Security & DPDP Compliance](#19-security--dpdp-compliance)
20. [Deployment & Scaling Plan](#20-deployment--scaling-plan)

---

## 1. SYSTEM OVERVIEW

### 1.1 What is YOU CAN?

YOU CAN is a **multi-academy learning platform** where multiple coaching academies across Maharashtra share **one single database** but each academy's data is **completely isolated**. No academy can see another academy's students, teachers, or results.

### 1.2 Target Users

| User | Description | Count Target |
|------|------------|-------------|
| Super Admin | Platform owner (you) | 1 |
| Academy Head | Owner/Director of each coaching academy | 1 per academy |
| Teacher | Faculty members teaching PCM/PCB subjects | 3-10 per academy |
| Student | Class 11-12 students preparing for MHT-CET, JEE, NEET | 50-500 per academy |
| Content Manager | Platform-level content team | 1-3 |

### 1.3 Target Exams & Syllabus

| Exam | Board | Subjects | Class |
|------|-------|---------|-------|
| MHT-CET | Maharashtra State Board | Physics, Chemistry, Mathematics | Class 11-12 |
| JEE Main/Advanced | CBSE/NCERT aligned | Physics, Chemistry, Mathematics | Class 11-12 |
| NEET | CBSE/NCERT aligned | Physics, Chemistry, Biology | Class 11-12 |

### 1.4 How Multiple Academies Work on One Database

```
┌─────────────────────────────────────────────────────────┐
│                    ONE DATABASE (Supabase/PostgreSQL)    │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Academy A   │  │  Academy B   │  │  Academy C   │    │
│  │  academy_id  │  │  academy_id  │  │  academy_id  │    │
│  │  = "acad_01" │  │  = "acad_02" │  │  = "acad_03" │    │
│  │             │  │             │  │             │     │
│  │  Teachers: 5 │  │  Teachers: 8 │  │  Teachers: 3 │    │
│  │  Students:120│  │  Students:200│  │  Students: 80│    │
│  │  Tests: 45   │  │  Tests: 70   │  │  Tests: 30   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │       SHARED MASTER CONTENT (Platform-wide)      │    │
│  │  60,000+ Questions │ PYQs │ NCERT │ eBalbharati  │    │
│  │  Available to ALL academies (read-only)          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              SUPER ADMIN (Platform Owner)         │    │
│  │  Can see ALL academies │ Manage everything        │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 1.5 Key Rule: Data Isolation

Every single table in the database has an `academy_id` column. When any user makes a request:
- The system automatically adds `WHERE academy_id = 'user's academy'` to every query
- A teacher from Academy A can NEVER see Academy B's students
- A student from Academy B can NEVER see Academy A's homework
- Only the Super Admin (platform owner) can see data across all academies

---

## 2. DESIGN SYSTEM & UI STANDARDS

### 2.1 Visual Identity — Primary Palette (Trust + Authority)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary Brand** | Deep Blue | `#1E40AF` | Header, primary buttons, active navigation |
| **Primary Light** | Sky Blue | `#3B82F6` | Hover states, secondary CTAs, highlights |
| **Primary Dark** | Navy | `#1E3A8A` | Footer, sidebar, dark mode background |

### 2.2 Secondary Palette (Clarity + Calm + Progress)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Secondary** | Emerald Green | `#10B981` | Success states, completed topics, "Submit" buttons |
| **Secondary Light** | Mint | `#6EE7B7` | Progress bars, positive feedback, hints |
| **Accent** | Amber | `#F59E0B` | Warnings, "Essential" priority tags, due-soon alerts |

### 2.3 Neutral Palette (Readability + Professionalism)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Background** | Off-White | `#F9FAFB` | Main canvas, cards, modals |
| **Surface** | White | `#FFFFFF` | Question cards, forms, tables |
| **Text Primary** | Charcoal | `#1F2937` | Headings, question text, labels |
| **Text Secondary** | Gray | `#6B7280` | Metadata, hints, disabled states |
| **Border** | Light Gray | `#E5E7EB` | Dividers, input borders, card outlines |

### 2.4 Status & Semantic Colors

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| Success | Green | `#10B981` | Correct answers, completed homework |
| Warning | Amber | `#F59E0B` | Pending deadlines, low accuracy |
| Error | Red | `#EF4444` | Wrong answers, validation errors |
| Info | Blue | `#3B82F6` | Tips, new features, notifications |
| Premium | Purple | `#8B5CF6` | Pro features, academy head tools |

### 2.5 Maharashtra-Inspired Accent (Optional Cultural Touch)

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Saffron Accent | Orange | `#FF9933` | Festival banners, motivational quotes, achievement badges |
| Green Accent | Green | `#138808` | Progress celebrations, "Board Topper" highlights |

> Use sparingly for emotional resonance — never for core UI elements.

### 2.6 Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Brand Logo | Outfit | 800 (Extra Bold) | 15-32px |
| Page Heading (H1) | Outfit | 800 (Extra Bold) | 28px, line-height 1.2 |
| Section Title (H3) | Outfit | 700 (Bold) | 16-18px |
| Body Text | Inter | 400-500 | 14px, line-height 1.65 |
| Form Labels | Inter | 600 (Semi Bold) | 13px |
| Labels / Tags | Inter | 600-700 | 11-12px, uppercase, tracking 0.05-0.1em |
| Stat Values | Outfit | 800 (Extra Bold) | 28px |
| Button Text | Inter | 600 (Semi Bold) | 13-15px |
| Table Headers | Inter | 600 (Semi Bold) | 12px, uppercase, tracking 0.05em |

### 2.7 Component Library

#### Card (Primary Container)
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
```

#### Primary Button (Main CTA)
```css
.btn-primary {
  background: #1E40AF;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  padding: 10px 20px;
  /* Hover: background #1E3A8A, shadow 0 4px 6px rgba(0,0,0,0.07) */
}
```

#### Status Badges
| Badge | Background | Text Color | Usage |
|-------|-----------|------------|-------|
| Blue Badge | `#EFF6FF` | `#1E40AF` | Info, Online count, Feature tag |
| Green Badge | `#ECFDF5` | `#059669` | Active, Correct, On track, Premium plan |
| Amber Badge | `#FFFBEB` | `#D97706` | Pending, Warning, Needs review, Free plan |
| Red Badge | `#FEF2F2` | `#EF4444` | Urgent, Wrong, Inactive, Critical alert |
| Purple Badge | `#F5F3FF` | `#8B5CF6` | Premium features, academy head tools |
| Gray Badge | `#F3F4F6` | `#6B7280` | Neutral, disabled, archived |

#### Progress Bar
```css
.progress-bar {
  height: 8px;
  background: #F3F4F6;
  border-radius: 100px;
  overflow: hidden;
}
/* Fill color: Green #10B981 (>=70%), Amber #F59E0B (40-69%), Red #EF4444 (<40%) */
```

#### Input Fields
```css
.form-input {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: #1F2937;
  /* Focus: border-color #3B82F6, box-shadow 0 0 0 3px rgba(59,130,246,0.1) */
}
```

### 2.8 Layout Patterns

| Pattern | Usage | Structure |
|---------|-------|-----------|
| **Sidebar layout** | Admin/Head dashboards | 240px sidebar + fluid main content |
| **Centered max-width** | Login, forms, student test setup | max-width 420px-700px, centered |
| **Two-column grid** | Dashboard widgets, analytics | grid-template-columns: 1fr 1fr |
| **Stats row** | Top of every dashboard | auto-fit grid, minmax(200px, 1fr) |
| **Data table** | User lists, submissions | Full-width table with hover rows, sticky headers |
| **Card grid** | Reports, quick actions | auto-fit grid, minmax(280px, 1fr) |

### 2.9 Animations

| Animation | CSS | Usage |
|-----------|-----|-------|
| Fade In | `opacity: 0 → 1, translateY: 8px → 0, 0.35s ease` | Page load, tab switch |
| Hover Shadow | `box-shadow transition 0.15s` | Card hover |
| Focus Ring | `box-shadow: 0 0 0 3px rgba(59,130,246,0.1)` | Input focus states |
| Progress Fill | `transition: width 0.8s ease` | Progress bars on load |

### 2.6 Grid Background Pattern
```css
.grid-bg {
  position: fixed;
  background-image: radial-gradient(rgba(139, 92, 246, 0.08) 1px, transparent 1px);
  background-size: 40px 40px;
}
```
Applied as a fixed overlay on every screen for the signature YOU CAN visual identity.

### 2.7 Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| Desktop (>1024px) | Full sidebar layout, 4-column stats, 2-column grids |
| Tablet (768-1024px) | Sidebar collapses to icons, 2-column stats |
| Mobile (<768px) | No sidebar (bottom nav instead), 2-column stats, stacked grids |

---

## 3. USER ROLES & PERMISSIONS

### 3.1 Role Hierarchy

```
SUPER ADMIN (Platform Owner - YOU)
    │
    ├── ACADEMY HEAD (Owner of each academy)
    │       │
    │       ├── TEACHER (Faculty members)
    │       │
    │       └── STUDENT (Class 11/12 students)
    │
    └── CONTENT MANAGER (Platform-level content team)
```

### 3.2 Detailed Permission Matrix

| Action | Super Admin | Academy Head | Teacher | Student |
|--------|:-----------:|:------------:|:-------:|:-------:|
| **Academy Management** |||||
| Create new academy | YES | NO | NO | NO |
| Edit academy details | YES | Own academy | NO | NO |
| Suspend/delete academy | YES | NO | NO | NO |
| View all academies | YES | NO | NO | NO |
| **User Management** |||||
| Add teachers | YES | Own academy | NO | NO |
| Add students | YES | Own academy | NO | NO |
| Bulk upload users (CSV) | YES | Own academy | NO | NO |
| Reset passwords | YES | Own academy | Own students | NO |
| Delete users | YES | Own academy | NO | NO |
| **Content Management** |||||
| Add platform-wide questions | YES | NO | NO | NO |
| Add academy-specific questions | YES | Own academy | Own subjects | NO |
| Upload study materials (PDF) | YES | Own academy | Own subjects | NO |
| View question bank | YES | Own academy | Own subjects | Assigned only |
| **Homework & Tests** |||||
| Create homework/test | NO | NO | YES (own batches) | NO |
| Assign to students | NO | NO | YES (own batches) | NO |
| Submit homework/test | NO | NO | NO | YES (assigned) |
| Grade/review submissions | NO | NO | YES (own batches) | NO |
| View results | YES | Own academy | Own batches | Own results |
| **Timetable** |||||
| Create timetable | NO | NO | YES (own classes) | NO |
| Edit timetable | NO | YES (override) | YES (own classes) | NO |
| View timetable | YES | Own academy | Own classes | Own class |
| **Analytics & Reports** |||||
| Platform-wide analytics | YES | NO | NO | NO |
| Academy-wide analytics | YES | Own academy | NO | NO |
| Batch/class analytics | YES | Own academy | Own batches | NO |
| Individual student analytics | YES | Own academy | Own students | Own data |
| Export reports (PDF/Excel) | YES | Own academy | Own batches | NO |
| **Doubt Resolution** |||||
| Open doubt room | NO | NO | YES | YES |
| View doubt history | YES | Own academy | Own students | Own doubts |
| **Notifications** |||||
| Platform-wide announcement | YES | NO | NO | NO |
| Academy announcement | YES | Own academy | NO | NO |
| Class/batch notification | YES | Own academy | Own batches | NO |

---

## 4. DATABASE DESIGN

### 4.1 Database Overview

| Table | Records (Est.) | Purpose |
|-------|---------------|---------|
| `academies` | 10-100 | Coaching academy profiles |
| `users` | 10,000-50,000 | All users (admin, head, teacher, student) |
| `subjects` | 8 | Physics, Chemistry, Maths, Biology x 2 classes |
| `chapters` | ~100 | All chapters mapped to subjects |
| `question_bank` | 60,000-100,000+ | Shared + academy-specific questions |
| `study_materials` | 500-2,000 | PDFs, notes, formula sheets, video links |
| `homework_assignments` | Growing | Teacher-created homework assignments |
| `homework_submissions` | Growing | Student homework submissions |
| `test_sessions` | Growing | Practice tests, mock exams |
| `timetables` | Growing | Monthly timetables per teacher/batch |
| `schedule_entries` | Growing | Daily topics within timetables |
| `doubt_sessions` | Growing | Student doubt queries + AI/teacher responses |
| `analytics_events` | Growing (large) | All user activity tracking |
| `notifications` | Growing | Push/in-app notifications |

### 4.2 Complete Table Schema (PostgreSQL / Supabase)

#### Table: `academies`
```sql
CREATE TABLE academies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100) DEFAULT 'Maharashtra',
    phone VARCHAR(20),
    email VARCHAR(255),
    streams TEXT[] DEFAULT '{PCM}',        -- ['PCM', 'PCB', 'PCMB']
    classes TEXT[] DEFAULT '{Class 12}',    -- ['Class 11', 'Class 12']
    logo_url TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'free',  -- 'free', 'basic', 'premium'
    subscription_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    max_students INT DEFAULT 500,
    max_teachers INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'academy_head', 'teacher', 'student', 'content_manager')),
    user_code VARCHAR(50) UNIQUE,          -- e.g., 'STU-ACAD01-0042'
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    password_hash TEXT NOT NULL,
    class_level VARCHAR(20),               -- 'Class 11' or 'Class 12' (students only)
    stream VARCHAR(10),                    -- 'PCM', 'PCB', 'PCMB'
    batch_name VARCHAR(100),               -- e.g., 'Morning Batch', 'Evening JEE'
    subjects TEXT[],                        -- teachers: ['Physics', 'Chemistry']
    parent_name VARCHAR(255),              -- students only
    parent_phone VARCHAR(20),              -- students only
    profile_photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    temp_password BOOLEAN DEFAULT true,    -- force password change on first login
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_academy ON users(academy_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_batch ON users(academy_id, batch_name);
```

#### Table: `subjects`
```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,            -- 'Physics', 'Chemistry', 'Mathematics', 'Biology'
    stream VARCHAR(10),                    -- 'PCM', 'PCB', 'PCMB'
    class_level VARCHAR(20),               -- 'Class 11', 'Class 12'
    board VARCHAR(50) DEFAULT 'Maharashtra State Board',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: `chapters`
```sql
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id),
    name VARCHAR(255) NOT NULL,
    chapter_number INT,
    class_level VARCHAR(20),
    topics TEXT[],                          -- ['Moment of Inertia', 'Torque', ...]
    exam_alignment TEXT[],                 -- ['MHT-CET', 'JEE', 'NEET']
    ebalbharati_ref VARCHAR(255),          -- textbook reference
    ncert_ref VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: `question_bank` (SHARED + ACADEMY-SPECIFIC)
```sql
CREATE TABLE question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID REFERENCES academies(id),  -- NULL = platform-wide shared content
    subject_id UUID REFERENCES subjects(id),
    chapter_id UUID REFERENCES chapters(id),
    created_by UUID REFERENCES users(id),
    
    question_text TEXT NOT NULL,
    question_html TEXT,                    -- rich text with images
    question_image_url TEXT,
    options JSONB NOT NULL,                -- {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_answer CHAR(1) NOT NULL,
    explanation TEXT,
    explanation_html TEXT,
    
    difficulty INT DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
    exam_type TEXT[] DEFAULT '{MHT-CET}',  -- ['MHT-CET', 'JEE', 'NEET']
    topic VARCHAR(255),
    is_pyq BOOLEAN DEFAULT false,
    pyq_year INT,
    pyq_exam VARCHAR(50),
    
    is_shared BOOLEAN DEFAULT false,       -- true = visible to all academies
    is_approved BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_qbank_academy ON question_bank(academy_id);
CREATE INDEX idx_qbank_subject ON question_bank(subject_id);
CREATE INDEX idx_qbank_chapter ON question_bank(chapter_id);
CREATE INDEX idx_qbank_shared ON question_bank(is_shared);
CREATE INDEX idx_qbank_difficulty ON question_bank(difficulty);
```

#### Table: `study_materials`
```sql
CREATE TABLE study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID REFERENCES academies(id),  -- NULL = platform-wide
    chapter_id UUID REFERENCES chapters(id),
    uploaded_by UUID REFERENCES users(id),
    
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('pdf', 'video', 'notes', 'pyq_set', 'formula_sheet')),
    file_url TEXT NOT NULL,
    description TEXT,
    
    is_shared BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    download_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: `homework_assignments`
```sql
CREATE TABLE homework_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL REFERENCES academies(id),
    teacher_id UUID NOT NULL REFERENCES users(id),
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    chapter_id UUID REFERENCES chapters(id),
    subject_id UUID REFERENCES subjects(id),
    
    question_ids UUID[],                   -- array of question_bank IDs
    custom_pdf_url TEXT,                   -- teacher-uploaded PDF (optional)
    
    assigned_to_batch VARCHAR(100),        -- entire batch
    assigned_to_students UUID[],           -- specific students (optional)
    class_level VARCHAR(20),
    
    deadline TIMESTAMP NOT NULL,
    max_marks INT DEFAULT 100,
    time_limit_minutes INT,                -- optional time limit
    
    allow_late_submission BOOLEAN DEFAULT false,
    show_solutions_after_deadline BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_homework_academy ON homework_assignments(academy_id);
CREATE INDEX idx_homework_teacher ON homework_assignments(teacher_id);
CREATE INDEX idx_homework_batch ON homework_assignments(academy_id, assigned_to_batch);
```

#### Table: `homework_submissions`
```sql
CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL REFERENCES academies(id),
    homework_id UUID NOT NULL REFERENCES homework_assignments(id),
    student_id UUID NOT NULL REFERENCES users(id),
    
    answers JSONB NOT NULL,                -- {"q_id_1": "A", "q_id_2": "C", ...}
    score INT,
    max_score INT,
    accuracy DECIMAL(5,2),
    time_spent_seconds INT,
    
    is_auto_graded BOOLEAN DEFAULT true,
    teacher_remarks TEXT,
    teacher_grade VARCHAR(10),             -- 'A+', 'A', 'B+', etc.
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    
    submitted_at TIMESTAMP DEFAULT NOW(),
    is_late BOOLEAN DEFAULT false,
    
    question_wise_data JSONB,              -- per-question: time_spent, attempts, correct/wrong
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_submission_academy ON homework_submissions(academy_id);
CREATE INDEX idx_submission_homework ON homework_submissions(homework_id);
CREATE INDEX idx_submission_student ON homework_submissions(student_id);
```

#### Table: `test_sessions`
```sql
CREATE TABLE test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL REFERENCES academies(id),
    student_id UUID NOT NULL REFERENCES users(id),
    
    test_type VARCHAR(30) CHECK (test_type IN ('practice', 'homework', 'mock_exam', 'chapter_test', 'revision')),
    exam_mode VARCHAR(20) DEFAULT 'MHT-CET',
    
    question_ids UUID[],
    answers JSONB,
    bookmarked_ids UUID[],
    flagged_ids UUID[],
    
    total_questions INT,
    correct INT,
    wrong INT,
    skipped INT,
    score DECIMAL(8,2),
    max_score DECIMAL(8,2),
    accuracy DECIMAL(5,2),
    
    time_limit_seconds INT,
    time_taken_seconds INT,
    
    subject VARCHAR(100),
    chapter VARCHAR(255),
    difficulty_distribution JSONB,
    
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_test_academy ON test_sessions(academy_id);
CREATE INDEX idx_test_student ON test_sessions(student_id);
CREATE INDEX idx_test_type ON test_sessions(test_type);
```

#### Table: `timetables`
```sql
CREATE TABLE timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL REFERENCES academies(id),
    teacher_id UUID NOT NULL REFERENCES users(id),
    
    class_level VARCHAR(20) NOT NULL,
    batch_name VARCHAR(100),
    subject_id UUID REFERENCES subjects(id),
    
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    approved_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timetable_academy ON timetables(academy_id);
CREATE INDEX idx_timetable_teacher ON timetables(teacher_id);
```

#### Table: `schedule_entries`
```sql
CREATE TABLE schedule_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timetable_id UUID NOT NULL REFERENCES timetables(id) ON DELETE CASCADE,
    academy_id UUID NOT NULL REFERENCES academies(id),
    
    date DATE NOT NULL,
    chapter_id UUID REFERENCES chapters(id),
    topic_name VARCHAR(255),
    
    priority_level VARCHAR(20) DEFAULT 'recommended' 
        CHECK (priority_level IN ('essential', 'recommended', 'optional')),
    
    linked_homework_id UUID REFERENCES homework_assignments(id),
    linked_test_id UUID,
    linked_material_ids UUID[],
    
    status VARCHAR(20) DEFAULT 'upcoming' 
        CHECK (status IN ('upcoming', 'in_progress', 'completed', 'delayed')),
    completion_rate DECIMAL(5,2) DEFAULT 0,
    
    teacher_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schedule_timetable ON schedule_entries(timetable_id);
CREATE INDEX idx_schedule_academy ON schedule_entries(academy_id);
CREATE INDEX idx_schedule_date ON schedule_entries(date);
CREATE INDEX idx_schedule_priority ON schedule_entries(priority_level);
```

#### Table: `doubt_sessions`
```sql
CREATE TABLE doubt_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL REFERENCES academies(id),
    student_id UUID NOT NULL REFERENCES users(id),
    teacher_id UUID REFERENCES users(id),
    
    subject VARCHAR(100),
    chapter VARCHAR(255),
    topic VARCHAR(255),
    
    question_text TEXT NOT NULL,
    question_image_url TEXT,
    
    ai_response TEXT,
    ai_related_pyqs TEXT[],
    ai_board_reference TEXT,
    
    teacher_response TEXT,
    teacher_response_image_url TEXT,
    
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'ai_resolved', 'teacher_resolved', 'closed')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    is_from_timetable_essential BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE INDEX idx_doubt_academy ON doubt_sessions(academy_id);
CREATE INDEX idx_doubt_student ON doubt_sessions(student_id);
CREATE INDEX idx_doubt_status ON doubt_sessions(status);
```

#### Table: `analytics_events`
```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID REFERENCES academies(id),
    user_id UUID REFERENCES users(id),
    
    event_type VARCHAR(100) NOT NULL,
    properties JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_academy ON analytics_events(academy_id);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_date ON analytics_events(created_at);
```

#### Table: `notifications`
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID REFERENCES academies(id),
    user_id UUID REFERENCES users(id),
    
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(30) CHECK (type IN ('homework', 'test', 'deadline', 'announcement', 'doubt_reply', 'system')),
    
    link_to TEXT,
    is_read BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id, is_read);
```

### 4.3 Entity Relationship Diagram

```
academies ─────┬──── users (teachers, students, heads)
               │
               ├──── homework_assignments ──── homework_submissions
               │
               ├──── test_sessions
               │
               ├──── timetables ──── schedule_entries
               │
               ├──── doubt_sessions
               │
               ├──── analytics_events
               │
               └──── notifications

subjects ──── chapters ──── question_bank
                        ──── study_materials

question_bank ──── (shared: academy_id = NULL, all can read)
              ──── (private: academy_id = X, only academy X can read)
```

---

## 5. ROW-LEVEL SECURITY (RLS) RULES

### 5.1 How RLS Works

Every API request includes the user's `academy_id` (from their JWT token). Supabase automatically filters data:

```sql
-- Users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Super Admin: can see all users across all academies
CREATE POLICY "super_admin_all_users" ON users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'super_admin')
    );

-- Academy Head: can see all users in their own academy
CREATE POLICY "head_own_academy_users" ON users
    FOR ALL USING (
        academy_id = (SELECT academy_id FROM users WHERE id = auth.uid())
        AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'academy_head')
    );

-- Teacher: can see students in their own academy
CREATE POLICY "teacher_own_academy_users" ON users
    FOR SELECT USING (
        academy_id = (SELECT academy_id FROM users WHERE id = auth.uid())
        AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'teacher')
    );

-- Student: can only see own profile
CREATE POLICY "student_own_profile" ON users
    FOR SELECT USING (id = auth.uid());
```

### 5.2 RLS Rules Summary

| Table | Super Admin | Academy Head | Teacher | Student |
|-------|------------|-------------|---------|---------|
| academies | ALL | Own academy (read) | NO | NO |
| users | ALL | Own academy | Own academy (read) | Own profile |
| question_bank | ALL | Own + shared | Own subject + shared | Assigned only |
| homework_assignments | ALL | Own academy | Own created | Own assigned |
| homework_submissions | ALL | Own academy | Own batches | Own submissions |
| test_sessions | ALL | Own academy | Own batches | Own sessions |
| timetables | ALL | Own academy | Own created | Own class (read) |
| schedule_entries | ALL | Own academy | Own timetables | Own class (read) |
| doubt_sessions | ALL | Own academy | Own assigned | Own doubts |
| analytics_events | ALL | Own academy | Own batches | Own events |
| notifications | ALL | Own academy | Own notifications | Own notifications |

---

## 6. LOGIN & AUTHENTICATION FLOW

### 6.1 Login Screen UI Specification

**Screen:** Full-screen centered form on dark background with grid pattern overlay

**Components:**
1. **Brand Header** — YOU CAN logo (56px icon + brand text), centered
2. **Title** — "Welcome Back" (sign in) or "Create Account" (sign up), 28px black weight
3. **Subtitle** — "Sign in to your academy dashboard", text-dim color

**Form Fields:**
| Field | Type | Placeholder | Validation |
|-------|------|------------|------------|
| Select Academy | Dropdown (select) | Lists all active academies | Required |
| Select Role | 3-card selector | Student / Teacher / Head (with icons) | Required, visual toggle |
| User ID | Text input | "e.g. STU-ACAD01-0042" | Required, validated against DB |
| Password | Password input | "Enter your password" | Required, min 8 chars |

**Buttons:**
- "Sign In" — btn-premium, full-width, 16px padding
- "Forgot Password? Reset via OTP" — text link, primary color
- "Platform Admin? Super Admin Login" — bottom link for super admin access

**States:**
- Error: Red banner below password field with error message
- Loading: Button shows spinner, disabled
- First login: Redirects to password change screen if `temp_password = true`

### 6.2 Login Flow Diagram

```
User Opens App
    ↓
Select Academy (dropdown with all active academies)
    ↓
Select Role (Student / Teacher / Head) — visual card selector
    ↓
Enter User ID + Password
    ↓
Click "Sign In"
    ↓
Backend validates:
    ├── Credentials correct? → No → Show error "Invalid User ID or Password"
    ├── academy_id match? → No → Show error "User not found in this academy"
    ├── Role match? → No → Show error "Incorrect role selected"
    ├── Account active? → No → Show error "Account suspended. Contact academy head"
    └── All valid ↓
    ↓
Is temp_password = true?
    ├── Yes → Redirect to "Change Password" screen
    └── No → Set JWT with { user_id, academy_id, role } → Redirect to role dashboard
    ↓
┌─────────────────┬──────────────────┬────────────────────┐
│ Student Dashboard│ Teacher Dashboard│ Academy Head Dash  │
└─────────────────┴──────────────────┴────────────────────┘
```

### 6.3 Password Reset Flow
1. Click "Forgot Password?"
2. Enter User ID + Academy
3. System sends 6-digit OTP to registered phone/email
4. Enter OTP → Verified
5. Enter new password (min 8 chars, must include number)
6. Password updated → Redirect to login

### 6.4 Session Management
| Setting | Value |
|---------|-------|
| Session Duration | 7 days (with refresh token) |
| Idle Timeout | 30 minutes → auto-logout |
| Concurrent Sessions | Max 2 devices per user |
| Token Storage | httpOnly secure cookie |

---

## 7. SUPER ADMIN PANEL

### 7.1 Layout Structure

**Sidebar Navigation (260px, fixed left):**
- Brand logo + "Super Admin" label
- Dashboard (active indicator)
- Academies
- All Users
- Content Manager
- --- separator ---
- Subscriptions
- Platform Analytics
- System Health
- Audit Logs
- Settings

**Main Content Area (fluid, right of sidebar):**
- Screen title (uppercase, 14px, primary color, 0.15em tracking)
- Page heading (36px, black weight)
- Description line (15px, text-dim)
- Content below

### 7.2 Dashboard Screen

**Stats Row (4 cards):**
| Stat | Value (sample) | Color |
|------|---------------|-------|
| Academies | 12 | gradient-text |
| Total Students | 1,850 | secondary (green) |
| Teachers | 85 | primary (purple) |
| Questions | 60,240 | yellow |

**Two-Column Grid Below:**

**Left Card — "Academy Performance":**
- List of all academies with name + progress bar + percentage
- Progress bar colors: Green (>=70%), Yellow (40-69%), Red (<40%)
- Shows top/bottom performing academies

**Right Card — "Platform Health":**
| Metric | Display |
|--------|---------|
| API Response Time | Badge: "45ms" (green) |
| Database Storage | Text: "12.5 GB / 50 GB" |
| Active Users (Now) | Badge: "342 online" (purple) |
| Uptime (30 days) | Badge: "99.97%" (green) |
| Last Backup | Text: "2 hours ago" |

**Full-Width Card — "Recent Activity":**
- Activity feed with icon (36px rounded square) + description + timestamp
- Types: New academy onboarded, Content synced, Engagement alerts, System events

### 7.3 Academies Screen

**Header:** Title + "+ Add New Academy" btn-premium button (top right)

**Full-Width Data Table:**
| Column | Width | Content |
|--------|-------|---------|
| Academy | 30% | Avatar circle (initial + color) + Name + Email |
| City | 10% | City name |
| Streams | 10% | Purple badge (PCM/PCB/PCMB) |
| Students | 8% | Number |
| Teachers | 8% | Number |
| Plan | 10% | Green badge (Premium) / Yellow badge (Free) |
| Status | 12% | Green dot "Active" / Red dot "Low Activity" / Gray dot "Suspended" |
| Action | 12% | "Edit" ghost button |

**Row hover:** subtle background highlight

### 7.4 Academy Onboarding Screen (5-Step Wizard)

**Step Indicator:** Horizontal 5-step progress bar at top
- Step 1: Academy Details (active — purple border + background)
- Step 2: Add Head
- Step 3: Upload Teachers
- Step 4: Upload Students
- Step 5: Go Live

**Step 1 — Academy Details Form:**
| Field | Type | Grid Position |
|-------|------|--------------|
| Academy Name | Text input | Col 1 |
| City | Text input | Col 2 |
| Full Address | Text input | Col 1 |
| Contact Phone | Text input | Col 2 |
| Email Address | Text input | Col 1 |
| Subscription Plan | Dropdown (Free/Basic/Premium) | Col 2 |
| Streams Offered | Toggle cards (PCM / PCB / PCMB) | Col 1 |
| Classes | Toggle cards (Class 11 / Class 12) | Col 2 |

**Footer:** "Cancel" ghost button + "Next: Add Academy Head →" btn-premium

**Step 2 — Add Academy Head:**
- Fields: Full Name, Email, Phone
- System auto-generates: User Code (HEAD-ACAD01-001), Temp Password
- Button: "Send Credentials via SMS/Email"

**Step 3 — Upload Teachers:**
- "Download CSV Template" button
- File upload dropzone (drag & drop)
- CSV columns: Name, Email, Phone, Subjects
- Preview table showing parsed data before confirmation
- System auto-generates: User Codes (TCH-ACAD01-001, TCH-ACAD01-002, ...)
- Button: "Create Accounts & Send Credentials"

**Step 4 — Upload Students:**
- Same flow as teachers
- CSV columns: Name, Class, Batch, Stream, Parent Name, Parent Phone
- System auto-generates: User Codes (STU-ACAD01-0001, STU-ACAD01-0002, ...)
- Options: "Print Credential Cards" or "Send via SMS"

**Step 5 — Go Live:**
- Summary of academy: name, teachers count, students count
- Toggle: "Mark academy as Active"
- Button: "Complete Onboarding"

### 7.5 Content Manager Screen

**Stats Row (4 cards):**
| Stat | Color |
|------|-------|
| Total Questions: 60,240 | gradient-text |
| Study Materials: 342 | secondary |
| PYQs: 14,500 | primary |
| Data Sources: 4 | yellow |

**Two-Column Grid:**

**Left — "Questions by Subject":**
- Physics: 18,450 — progress bar (purple)
- Chemistry: 16,200 — progress bar (green)
- Mathematics: 15,890 — progress bar (yellow)
- Biology: 9,700 — progress bar (red)

**Right — "Quick Actions" (4 action cards):**
| Action | Icon | Description |
|--------|------|------------|
| Bulk Import Questions | 📤 | Upload JSON/CSV file |
| Upload Study Material | 📄 | PDF, Notes, Formula Sheets |
| Sync External Sources | 🔄 | JEE/NEET/CET datasets |
| Push Update to All Academies | 📢 | Sync new content platform-wide |

---

## 8. ACADEMY HEAD PANEL

### 8.1 Dashboard Screen

**Header:** "Academy Head" label + Green badge "Vidya Academy, Pune"

**Stats Row (4 cards):**
| Stat | Color | Border |
|------|-------|--------|
| Total Students: 120 | gradient-text | — |
| Avg Accuracy: 82% | secondary | — |
| HW Completion: 78% | primary | — |
| Teachers Active: 5/5 | yellow | — |

**Batch Comparison Card (full-width):**
- Horizontal progress bars (10px height) per batch:
  - Morning JEE Batch (Class 12): 88% — green badge
  - Evening CET Batch (Class 12): 72% — yellow badge
  - Weekend NEET Batch (Class 12): 80% — green badge
  - Class 11 Foundation: 55% — red badge

**Alerts Card (full-width, left yellow border):**
- Warning items with icon + text:
  - "Teacher Dr. Joshi has 12 unreviewed homework submissions"
  - "Class 11 Foundation batch completion rate dropped below 60%"
  - "5 new students registered this week - pending batch assignment"

### 8.2 Teacher Management Screen

**Full-Width Data Table:**
| Column | Content |
|--------|---------|
| Teacher | Circle avatar (initials) + Name + User Code |
| Subject | Subject name |
| Batches | Number of assigned batches |
| HW Assigned | Total homework created |
| HW Reviewed | Total reviewed (highlighted if far less than assigned) |
| Response Time | Badge — Green (<4hrs), Yellow (4-12hrs), Red (>12hrs) |
| Rating | Star rating (out of 5) |

**Row highlighting:** Yellow background for teachers with many unreviewed submissions

### 8.3 Reports & Export Screen

**Card Grid (2x2):**
| Report | Icon | Description | Export Button |
|--------|------|------------|--------------|
| Monthly Progress Report | 📊 | Student-wise accuracy, HW completion, test scores | Generate PDF |
| Batch Comparison | 📈 | Side-by-side performance of all batches | Generate Excel |
| Parent Report Card | 👨‍👩‍👦 | Individual student report with teacher remarks | Generate PDF |
| Board Compliance Audit | 📋 | Syllabus coverage, timetable adherence, attendance | Generate PDF |

---

## 9. TEACHER PANEL

### 9.1 Dashboard Screen

**Header:** "Teacher Panel" label + Purple badge "Dr. Patil - Physics"
**Welcome:** "Good Morning, Dr. Patil" + subtitle with academy, subject, batch count, student count

**Stats Row (4 cards with left colored border):**
| Stat | Color | Border Color |
|------|-------|-------------|
| Active Batches: 3 | gradient-text | primary |
| Submitted HW: 78/95 | secondary | secondary |
| Pending Reviews: 8 | accent | accent |
| Avg Score: 87% | yellow | yellow |

**Two-Column Grid:**

**Left — "Today's Tasks":**
- Checklist with checkboxes:
  - [ ] Review Morning Batch HW (12 pending) — Red "Urgent" badge
  - [ ] Create Chapter 5 test for Evening Batch
  - [ ] Update May timetable
  - [x] Upload Electrostatics notes (strikethrough, dimmed)

**Right — "Student Activity (Live)":**
- Live indicators (colored dots):
  - Green: 12 students active now
  - Purple: 3 new doubt requests
  - Yellow: 45 tests completed today
  - Red: 5 students missed deadline

**Quick Action Buttons (bottom):**
- "+ Assign Homework" — btn-premium
- "+ Create Test" — glass-card ghost
- "View Timetable" — glass-card ghost
- "Export Reports" — glass-card ghost

### 9.2 Assign Homework Screen

**Full-Width Form Card:**

**Row 1 (2 columns):**
| Field | Type | Options |
|-------|------|---------|
| Select Batch | Dropdown | "Class 12 - Morning JEE Batch (35 students)" etc. |
| Subject | Dropdown | Pre-filled based on teacher's assigned subjects |

**Row 2 (2 columns):**
| Field | Type | Options |
|-------|------|---------|
| Chapter | Dropdown | Chapter list from syllabus |
| Topic (Optional) | Dropdown | Topics within selected chapter |

**Question Selection Section:**
- Three source buttons: "From Platform Bank" (premium) / "Upload Custom PDF" (ghost) / "Create Custom Questions" (ghost)
- Selected Questions Summary Card:
  - "Selected: 10 questions" with difficulty badges (Green: 4 Easy, Yellow: 4 Medium, Red: 2 Hard)
  - Chip tags showing selected question topics

**Settings Row (3 columns):**
| Field | Type |
|-------|------|
| Deadline | Date-time picker |
| Time Limit | Dropdown (No Limit / 30 / 45 / 60 minutes) |
| Options | Checkboxes: "Show solutions after deadline" (checked), "Allow late submission" |

**Footer:** "Save Draft" ghost button + "Publish & Notify Students" btn-premium

### 9.3 Timetable Screen (Calendar View)

**Header:** Title + Month navigation (← May 2026 →)
**Subtitle:** "Class 12 Morning JEE Batch | Physics | Drag topics to dates"

**Priority Legend:** Three badges — Red "Essential", Yellow "Recommended", Green "Optional"

**Monthly Calendar Grid (7 columns x rows):**
- Day cells with:
  - Day number (14px bold)
  - Topic tag (8px, colored based on priority level):
    - Red background: Essential topics (e.g., "Electrostatics", "Coulomb's Law")
    - Yellow background: Recommended (e.g., "Practice Set", "Potential")
    - Green background: Optional (e.g., "Capacitance", "Revision")
    - Purple border + background: Test days (e.g., "CHAPTER TEST")
  - Sunday cells dimmed (0.5 opacity)
  - Current day: primary border highlight

**Footer:** "Save Draft" ghost + "Publish Timetable" btn-premium

### 9.4 Review Submissions Screen

**Subtitle:** "Electrostatics HW - Morning JEE Batch | Deadline: Apr 28, 2026"

**Stats Row (5 cards):**
| Stat | Color |
|------|-------|
| Submitted: 28 | secondary |
| Pending: 5 | yellow |
| Late: 2 | accent |
| Avg Score: 76% | gradient-text |
| Avg Time: 22 min | primary |

**Data Table:**
| Column | Content |
|--------|---------|
| Student | Name (bold) |
| Score | Colored: Green (>=70%), Yellow (40-69%), Red (<40%) + fraction |
| Time | Minutes |
| Weak Areas | Red text listing weak topics (or "-" if none) |
| Status | Badge: "Reviewed" (green) / "Needs Review" (yellow) / "Not Submitted" (red) |
| Action | "View" ghost button / "Review" premium button / "Remind" ghost button |

**Row highlighting:** Yellow background for "Needs Review" rows, dimmed for "Not Submitted"

### 9.5 Doubt Room Screen (Split Layout)

**Left Panel (320px) — "Open Doubts" List:**
- Each doubt card:
  - Student name (13px bold)
  - Priority badge (Red "Urgent", Yellow "Normal", Green "AI Resolved")
  - Question preview (11px, text-dim, truncated)
  - Active doubt highlighted with primary background

**Right Panel (fluid) — Chat Interface:**
- **Header:** Student name + topic path (e.g., "Physics > Electrostatics > Gauss's Law") + badge if from essential timetable topic
- **Chat area:**
  - Student messages: right-aligned, glass-card with primary tint
  - AI suggestion: left-aligned, glass-card with "AI SUGGESTION" label in primary color
  - System note: centered, small text (e.g., "Student marked AI response as 'Not fully clear'")
- **Input area:** textarea + "Send Reply" btn-premium

---

## 10. STUDENT PANEL

### 10.1 Dashboard Screen

**Header:** "Student Dashboard" + Green badge "Vidya Academy"
**Welcome:** "Hello, Rahul!" + "Class 12 PCM | Morning JEE Batch | STU-ACAD01-0042"

**Stats Row (4 cards with left colored border):**
| Stat | Color | Border |
|------|-------|--------|
| Accuracy: 85.5% | gradient-text | primary |
| Qs Solved: 1,450 | secondary | secondary |
| Pending HW: 3 | accent | accent |
| Chapters Done: 12 | yellow | yellow |

**Two-Column Grid:**

**Left — "Upcoming Deadlines":**
- Each deadline card with left colored border:
  - Red border: "Electrostatics HW" — "Due Tomorrow 11:59PM" (red text)
  - Yellow border: "Chemical Kinetics Test" — "3 days left" (yellow text)
  - Green border: "Integration Practice Set" — "No deadline" (green text)
  - Each shows: title, question count, subject, teacher name

**Right — "This Week's Timetable":**
- Day-by-day list:
  - Day label (36px width, bold, dim) + Priority badge + Topic name
  - Mon: [Essential] Rotational Dynamics
  - Tue: [Essential] Chemical Kinetics
  - Wed: [Recommend] Integration
  - Thu: [Essential] Genetics
  - Fri: [Test] Weekly Revision Test
- **AI Alert Box (bottom):** Red-tinted card: "Weak area detected: Rotational Dynamics — practice recommended before Friday test"

**Quick Action Buttons:** "Start Practice" (premium) + "View All Homework" + "Ask a Doubt" + "Study Materials" (ghost)

### 10.2 Homework Screen (Test Interface)

**Two-Column Layout:** Main question area (left, fluid) + Navigator sidebar (right, 340px)

**Main Area (glass-card):**
- **Header:** Purple badge "Question 3 of 10" + chapter/topic path (right)
- **Question Text:** 20px bold, 1.6 line-height, left purple border (4px) + 24px padding
- **Options Grid (2x2):**
  - Each option: glass-card with letter badge (32px square) + answer text
  - Selected option: purple border (2px), purple-tinted background, letter badge turns solid purple
  - Unselected: white/10 background, dim border
- **Navigation Footer:** "Previous" (ghost) + "Clear" (yellow-tinted) + "Save & Next" (premium)

**Right Sidebar:**
- **Question Navigator:** 5-column grid of numbered squares (40x40px)
  - Green: answered (secondary background + border)
  - Purple border: current question (with glow shadow)
  - Red: flagged
  - Gray: not visited
- **Progress Card:** Green-tinted glass-card with answered count (28px bold), progress bar
- **Submit Button:** Full-width btn-premium "Submit Homework"
- **Doubt Link:** "Have a doubt? Ask AI" — centered text link

### 10.3 Practice Test Setup Screen

**Centered Form (max-width 800px):**

**Row 1 (2 columns):**
| Field | Options |
|-------|---------|
| Class | Class 12 (2025-26), Class 11 (2025-26) |
| Subject | Physics, Chemistry, Mathematics, Biology |

**Row 2 (2 columns):**
| Field | Options |
|-------|---------|
| Chapter | Dynamic based on subject selection |
| Exam Mode | Toggle cards: MHT-CET (active) / JEE / NEET |

**Row 3 (2 columns):**
| Field | Options |
|-------|---------|
| Number of Questions | 10 / 20 / 30 |
| Difficulty Mix | Balanced / Easy Focus / Hard Focus |

**CTA:** Full-width btn-premium "Start Practice Test →" (18px, 16px padding)

### 10.4 Results Screen

**Stats Row (4 cards):**
| Stat | Card Style |
|------|-----------|
| Accuracy: 80% | gradient-text |
| Correct: 8 | green background + border |
| Wrong: 1 | red background + border |
| Skipped: 1 | yellow background + border |

**Subject Breakdown Card:**
- Subject name + fraction + percentage
- Progress bar (8px height): Green (>=70%), Yellow (40-69%), Red (<40%)

**Question Navigator Card:**
- Row of numbered circles (44x44px):
  - Green border + background: correct
  - Red border + background: wrong
  - Yellow border + background: skipped
- Click any number to jump to that question's review

**Answer Review Card (for each question):**
- **Header:** "Question 3 — Wrong" (colored label)
- **Question text:** left border (accent color), padded
- **Options grid (2x2):**
  - Correct answer: green border (2px), green background, green letter badge, "Correct" label
  - User's wrong answer: red border (2px), red background, red letter badge, "Your Answer" label
  - Other options: default border, no highlight
- **Explanation Box:** Purple-tinted glass-card with "EXPLANATION" label + explanation text

### 10.5 AI Doubt Solver Screen

**Chat Interface (full-width glass-card, min-height 400px):**

**Empty State:**
- Robot emoji (64px), "How can I help you today?" heading
- "Ask me any doubt from Physics, Chemistry, Maths, or Biology" description
- Suggested question chips (clickable glass-card tags)

**Chat Messages:**
- **User bubble:** Right-aligned, primary-tinted glass-card, "Y" badge
- **AI bubble:** Left-aligned, default glass-card with:
  - "AI" badge (secondary color) + "AI Tutor - [Subject]" label
  - Explanation text (14px, 1.7 line-height)
  - Related PYQs box: Purple-tinted card with exam+year chips
  - Board reference: Text with book emoji (e.g., "Section 4.5 of eBalbharati Physics")

**Loading State:** Three bouncing dots (primary color, staggered animation)

**Input Bar (glass-card):**
- Subject dropdown (140px width)
- Textarea (flex: 1, 2 rows, resizable)
- "Send" btn-premium

### 10.6 Progress / Analytics Screen

**Stats Row (4 cards):**
| Stat | Color |
|------|-------|
| Overall Accuracy: 85.5% | gradient-text |
| Tests Taken: 45 | secondary |
| Questions Solved: 1,450 | primary |
| Day Streak: 7 | yellow |

**Two-Column Grid:**

**Left — "Subject-wise Accuracy":**
- Physics: 88% (green bar)
- Chemistry: 82% (green bar)
- Mathematics: 75% (yellow bar)
- Biology: 90% (green bar)

**Right — "Weak Topics (AI Detected)":**
- Each topic card with left colored border:
  - Red border: "Rotational Dynamics" — Physics, 45% accuracy — "Practice" button
  - Yellow border: "Organic Chemistry" — Chemistry, 52% accuracy — "Practice" button
  - Yellow border: "Differential Equations" — Mathematics, 58% accuracy — "Practice" button

**Full-Width — "Recent Test History":**
- List of test cards:
  - Accuracy circle (52px, colored: green/yellow/red, bold percentage)
  - Test name + subject
  - Score fraction + date
  - Time taken (right-aligned)

---

## 11. TIMETABLE & SCHEDULING SYSTEM

### 11.1 Database Tables
- `timetables` — Monthly timetable per teacher per batch
- `schedule_entries` — Daily topic entries within a timetable

### 11.2 Priority Levels

| Level | Color | Badge | Meaning |
|-------|-------|-------|---------|
| Essential | Red (#F43F5E) | 🔴 Essential | Must complete — tested in exams |
| Recommended | Yellow (#F59E0B) | 🟡 Recommended | Practice advised for strong preparation |
| Optional | Green (#10B981) | 🟢 Optional | Self-study, revision material |

### 11.3 Teacher Workflow
1. Open Timetable page → select batch + month
2. Calendar view (monthly/weekly) with empty day cells
3. Drag-and-drop chapters/topics from syllabus panel onto dates
4. Assign priority_level per topic
5. Link study materials, homework, or tests to each topic
6. Set monthly coverage targets
7. Publish → auto-notifies students & parents
8. Track real-time completion_rate as students submit linked work
9. Edit: update dates, mark "delayed" or "completed"

### 11.4 Student View
- "This Week's Timetable" card on dashboard with priority badges
- Click topic → view linked notes, homework deadlines, practice tests
- Progress auto-updates based on submission status
- Smart alerts: "Essential topic due tomorrow", "3 pending recommended topics"
- Offline sync for low-connectivity areas

### 11.5 Academy Head View
- Matrix: Teachers x Classes x Monthly Coverage %
- Alerts for unassigned timetables, delayed essential topics, low completion
- Compare planned vs actual across batches
- Optional approval workflow (lock/standardize timetables)

---

## 12. AI DOUBT RESOLUTION ENGINE

### 12.1 Flow

```
Student asks doubt (text + optional image)
    ↓
AI Engine processes query:
    1. Identify subject + chapter + topic
    2. Search question_bank for related PYQs
    3. Generate explanation using LLM (OpenAI / local model)
    4. Attach board reference (eBalbharati / NCERT section)
    ↓
AI Response displayed with:
    - Explanation text
    - Related PYQ chips (e.g., "JEE 2023 Q12", "MHT-CET 2022 Q45")
    - Board reference link
    ↓
Student can:
    ├── Mark as "Resolved" → doubt closed
    └── Mark as "Not clear" → escalated to teacher
        ↓
Teacher gets notification in Doubt Room
    ↓
Teacher responds with text/whiteboard
    ↓
Doubt resolved
```

### 12.2 AI Priority Rules
- Doubts from "Essential" timetable topics get `priority = 'urgent'`
- AI responses include eBalbharati page references for Maharashtra Board alignment
- Spaced revision system auto-schedules follow-up practice for doubts

---

## 13. NOTIFICATION SYSTEM

### 13.1 Notification Types

| Type | Trigger | Recipients | Channel |
|------|---------|-----------|---------|
| `homework` | Teacher publishes homework | All batch students | Push + In-app |
| `deadline` | 24 hours before deadline | Students who haven't submitted | Push + In-app |
| `test` | Teacher creates test | Assigned students | In-app |
| `doubt_reply` | Teacher responds to doubt | Student who asked | Push + In-app |
| `announcement` | Head/Admin posts announcement | All academy users | Push + In-app |
| `system` | Account created, password reset | Individual user | SMS/Email |
| `alert` | Low completion, missed deadlines | Academy Head | In-app |

### 13.2 Notification UI
- Bell icon in nav bar with unread count badge
- Dropdown panel showing recent notifications
- Each notification: icon + title + message + timestamp + "mark read" action
- Click notification → navigates to relevant page

---

## 14. REPORTING & EXPORT ENGINE

### 14.1 Available Reports

| Report | Generated By | Format | Content |
|--------|-------------|--------|---------|
| Monthly Progress | Academy Head | PDF | Per-student: accuracy, HW completion, test scores, weak topics |
| Batch Comparison | Academy Head | Excel | Side-by-side metrics for all batches |
| Parent Report Card | Academy Head / Teacher | PDF | Individual student with grades, remarks, improvement areas |
| Board Compliance Audit | Academy Head | PDF | Syllabus coverage %, timetable adherence, teacher activity |
| Batch Performance Sheet | Teacher | PDF/Excel | Batch-level: scores, submission rates, time analysis |
| Platform Usage Report | Super Admin | Excel | Academy-wise: active users, tests taken, storage used |

### 14.2 Report Generation Tech
- **PDF:** jsPDF + html2canvas (client-side rendering)
- **Excel:** SheetJS (xlsx library)
- **Charts in reports:** Recharts rendered to SVG → embedded in PDF

---

## 15. CONTENT PIPELINE & DATA INGESTION

### 15.1 Data Sources

| Source | Content | Format | Size |
|--------|---------|--------|------|
| JEE Mains PYQs (GitHub) | 14,000+ Questions (PCM) | Python/JSON | ~50MB |
| NEET Benchmark (HuggingFace) | 500+ Authentic Qs (Images) | Parquet | ~200MB |
| Entrance Exam Dataset (Kaggle) | 100K+ Mixed Prep Qs | JSON | ~300MB |
| MHT-CET Mock (GitHub) | Board-specific logic | PHP/MySQL | ~10MB |
| eBalbharati Textbooks | Chapter references | PDF | Manual mapping |
| NCERT Textbooks | Chapter references | PDF | Manual mapping |

### 15.2 Ingestion Pipeline

```
External Source (JSON/CSV/Parquet)
    ↓
Ingestion Script (Python: ingest_master.py)
    ↓
Normalization:
    - Map to standard schema (subject, chapter, topic, difficulty)
    - Deduplicate by question_text hash
    - Tag with exam_type and difficulty
    - Link to chapters table
    ↓
Validation:
    - Verify all required fields present
    - Check options count (must be 4: A-D)
    - Verify correct_answer is one of A/B/C/D
    ↓
Insert into question_bank with is_shared = true
    ↓
Push notification to academies: "X new questions available"
```

### 15.3 Current Database Status
- 60 questions (locally seeded via local_db.json)
- 101 chapters across Class 11-12, all 4 subjects
- ~390 topics mapped

---

## 16. STEP-BY-STEP WORKING FLOW

### 16.1 Complete User Journey (End to End)

```
STEP 1: PLATFORM SETUP (Super Admin)
    ↓
    Super Admin logs in to admin panel
    ↓
    Clicks "+ Add New Academy"
    ↓
    Fills 5-step onboarding wizard:
        Step 1: Academy name, city, streams, classes
        Step 2: Add Academy Head (name, email, phone)
        Step 3: Upload teachers CSV → auto-generate credentials
        Step 4: Upload students CSV → auto-generate credentials
        Step 5: Review & mark academy as Active
    ↓
    Credentials sent to academy via SMS/email/printed cards

STEP 2: ACADEMY GOES LIVE
    ↓
    Academy Head logs in → sees dashboard
    ↓
    Verifies teacher & student accounts are active
    ↓
    Sets academy-wide goals (optional)
    ↓
    Reviews batch structure

STEP 3: TEACHER STARTS WORKING
    ↓
    Teacher logs in → sees assigned batches
    ↓
    Creates monthly timetable:
        → Opens Calendar view for May 2026
        → Drags "Electrostatics" to May 1
        → Marks it as "Essential" (red priority)
        → Links study PDF + practice set
        → Publishes → students get notified
    ↓
    Assigns homework:
        → Selects "Class 12 Morning JEE Batch"
        → Picks chapter "Electrostatics"
        → Selects 10 questions from platform bank
        → Sets deadline: 3 days
        → Publishes → 35 students notified

STEP 4: STUDENT COMPLETES WORK
    ↓
    Student logs in → sees dashboard
    ↓
    "Upcoming Deadlines" shows: Electrostatics HW — Due Tomorrow
    ↓
    Clicks homework → test interface opens
    ↓
    Question 1 appears with 4 options (A/B/C/D)
    ↓
    Selects answer → option highlights purple
    ↓
    Clicks "Save & Next" → moves to Q2
    ↓
    Uses navigator to jump to any question
    ↓
    Clicks "Submit Homework"
    ↓
    Confirmation modal: "You answered 9/10 questions. 1 unanswered!"
    ↓
    Clicks "Submit" → auto-graded instantly
    ↓
    Results page shows:
        → 7/10 correct (70% accuracy)
        → Subject breakdown with progress bar
        → Question navigator: green (correct), red (wrong), yellow (skipped)
    ↓
    Clicks wrong question (#3) → review shows:
        → Question text
        → Your answer (red highlight) vs Correct answer (green highlight)
        → Explanation box with eBalbharati reference
    ↓
    Has doubt on Q3 → clicks "Ask a Doubt"
    ↓
    Doubt page opens → types question
    ↓
    AI gives explanation + related PYQs + board reference
    ↓
    Not satisfied → clicks "Ask Teacher"
    ↓
    Teacher gets notification in Doubt Room

STEP 5: TEACHER REVIEWS
    ↓
    Teacher opens "Review Submissions"
    ↓
    Table shows: 32/35 submitted, 3 pending
    ↓
    Clicks "Review" on Amit Kulkarni (4/10 score)
    ↓
    Views answer-by-answer breakdown
    ↓
    Adds remarks: "Focus on Gauss's Law fundamentals"
    ↓
    Grades: "B-" 
    ↓
    Clicks "Remind" for 3 students who haven't submitted
    ↓
    Opens Doubt Room → sees Amit's doubt
    ↓
    AI suggestion already shown → teacher adds detailed explanation
    ↓
    Sends reply → student notified

STEP 6: ACADEMY HEAD MONITORS
    ↓
    Head opens dashboard
    ↓
    Sees batch comparison:
        Morning JEE: 88% (green)
        Evening CET: 72% (yellow)
        Class 11 Foundation: 55% (red — ALERT)
    ↓
    Clicks "Teachers" → sees Dr. Joshi has 12 unreviewed submissions
    ↓
    Sends message to Dr. Joshi
    ↓
    Generates "Monthly Progress Report" PDF for parent meeting
    ↓
    Downloads "Parent Report Card" for individual students

STEP 7: SUPER ADMIN OVERSEES
    ↓
    Views all 12 academies on central dashboard
    ↓
    Notices "Bright Future Academy" engagement at 54% (red)
    ↓
    Contacts academy head for support
    ↓
    Opens Content Manager → syncs 5,000 new JEE PYQs
    ↓
    Clicks "Push Update to All Academies"
    ↓
    All 12 academies now have updated question bank
    ↓
    Generates platform-wide usage report
```

---

## 17. TECH STACK & ARCHITECTURE

### 17.1 Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | **Next.js 14 + Tailwind CSS** | SSR, routing, glassmorphism design system |
| Auth | **Supabase Auth** | Email/password, role claims in JWT, OTP |
| Database | **Supabase (PostgreSQL)** | RLS for multi-tenancy, real-time subscriptions |
| Storage | **Supabase Storage** | PDFs, images, profile photos |
| Real-time | **Supabase Realtime** | Live doubt responses, dashboard updates |
| Calendar | **@fullcalendar/react** | Timetable drag-and-drop UI |
| Charts | **Recharts** | Analytics dashboards, performance graphs |
| Notifications | **Firebase Cloud Messaging** | Push notifications to mobile/web |
| PDF Export | **jsPDF + html2canvas** | Generate downloadable reports |
| Excel Export | **SheetJS (xlsx)** | Excel report generation |
| CSV Import | **Papa Parse** | Bulk user upload from Excel/CSV |
| AI Doubts | **OpenAI API / LangChain** | AI-powered doubt resolution |
| Deployment | **Vercel + Supabase Cloud** | Auto-scaling, CDN, SSL |

### 17.2 Architecture Diagram

```
┌───────────────────────────────────────────────────────────┐
│                      USERS                                 │
│  Students │ Teachers │ Academy Heads │ Super Admin          │
└─────────────────────┬─────────────────────────────────────┘
                      │ HTTPS
                      ↓
┌───────────────────────────────────────────────────────────┐
│                   NEXT.JS (Vercel)                          │
│  Pages: Login │ Dashboard │ Homework │ Tests │ Analytics    │
│  API Routes: /api/auth │ /api/homework │ /api/test │ etc.  │
│  Middleware: academy_id injection │ role validation          │
└─────────────────────┬─────────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
┌──────────────┐ ┌─────────┐ ┌──────────┐
│  Supabase     │ │ Supabase│ │ External │
│  PostgreSQL   │ │ Storage │ │ APIs     │
│  (with RLS)   │ │ (Files) │ │ (OpenAI) │
│               │ │         │ │          │
│  14 tables    │ │ PDFs    │ │ AI Doubt │
│  academy_id   │ │ Images  │ │ Solver   │
│  isolation    │ │ Reports │ │          │
└──────────────┘ └─────────┘ └──────────┘
```

---

## 18. API ENDPOINTS

### 18.1 Authentication

| Method | Endpoint | Role | Purpose |
|--------|---------|------|---------|
| POST | `/api/auth/login` | All | Login with academy + credentials |
| POST | `/api/auth/logout` | All | End session |
| POST | `/api/auth/reset-password` | All | Request OTP for password reset |
| POST | `/api/auth/verify-otp` | All | Verify OTP code |
| PUT | `/api/auth/change-password` | All | Change password (first login or manual) |

### 18.2 Academy Management (Super Admin)

| Method | Endpoint | Purpose |
|--------|---------|---------|
| GET | `/api/academies` | List all academies |
| POST | `/api/academies` | Create new academy |
| GET | `/api/academies/:id` | Get academy details |
| PUT | `/api/academies/:id` | Update academy |
| DELETE | `/api/academies/:id` | Suspend/delete academy |
| POST | `/api/academies/:id/bulk-upload` | Upload CSV of users |
| GET | `/api/academies/:id/stats` | Get academy statistics |

### 18.3 User Management

| Method | Endpoint | Role | Purpose |
|--------|---------|------|---------|
| GET | `/api/users` | Admin, Head | List users (filtered by academy) |
| POST | `/api/users` | Admin, Head | Create single user |
| GET | `/api/users/:id` | All (own profile) | Get user details |
| PUT | `/api/users/:id` | Admin, Head | Update user |
| DELETE | `/api/users/:id` | Admin, Head | Deactivate user |
| POST | `/api/users/:id/reset-password` | Admin, Head, Teacher | Reset user password |

### 18.4 Content

| Method | Endpoint | Role | Purpose |
|--------|---------|------|---------|
| GET | `/api/questions` | All | List questions (filtered by RLS) |
| POST | `/api/questions` | Admin, Teacher | Add question |
| PUT | `/api/questions/:id` | Admin, Teacher | Update question |
| DELETE | `/api/questions/:id` | Admin | Delete question |
| POST | `/api/questions/bulk-import` | Admin | Bulk import from JSON/CSV |
| GET | `/api/materials` | All | List study materials |
| POST | `/api/materials` | Admin, Teacher | Upload study material |
| GET | `/api/chapters` | All | List chapters by subject |

### 18.5 Homework

| Method | Endpoint | Role | Purpose |
|--------|---------|------|---------|
| GET | `/api/homework` | Teacher, Student | List homework |
| POST | `/api/homework` | Teacher | Create & assign homework |
| GET | `/api/homework/:id` | Teacher, Student | Get homework details |
| PUT | `/api/homework/:id` | Teacher | Update homework |
| POST | `/api/homework/:id/submit` | Student | Submit answers |
| GET | `/api/homework/:id/submissions` | Teacher | View all submissions |
| PUT | `/api/homework/:id/submissions/:sid/review` | Teacher | Add remarks/grade |

### 18.6 Tests

| Method | Endpoint | Role | Purpose |
|--------|---------|------|---------|
| POST | `/api/tests/generate` | Student, Teacher | Generate test from question bank |
| GET | `/api/tests/:id` | Student, Teacher | Get test details |
| POST | `/api/tests/:id/submit` | Student | Submit test answers |
| GET | `/api/tests/:id/results` | Student, Teacher | View results + review |
| GET | `/api/tests/history` | Student | Get test history |

### 18.7 Timetable

| Method | Endpoint | Role | Purpose |
|--------|---------|------|---------|
| GET | `/api/timetables` | Teacher, Student, Head | List timetables |
| POST | `/api/timetables` | Teacher | Create timetable |
| GET | `/api/timetables/:id` | Teacher, Student, Head | Get timetable with entries |
| PUT | `/api/timetables/:id` | Teacher | Update timetable |
| PUT | `/api/timetables/:id/publish` | Teacher | Publish to students |
| POST | `/api/timetables/:id/entries` | Teacher | Add schedule entry |
| PUT | `/api/timetables/:id/entries/:eid` | Teacher | Update entry |

### 18.8 Doubts

| Method | Endpoint | Role | Purpose |
|--------|---------|------|---------|
| GET | `/api/doubts` | Student, Teacher | List doubts |
| POST | `/api/doubts` | Student | Ask a doubt |
| GET | `/api/doubts/:id` | Student, Teacher | Get doubt thread |
| PUT | `/api/doubts/:id/respond` | Teacher | Respond to doubt |
| PUT | `/api/doubts/:id/resolve` | Student, Teacher | Mark as resolved |

### 18.9 Analytics

| Method | Endpoint | Role | Purpose |
|--------|---------|------|---------|
| GET | `/api/analytics/student/:id` | Student, Teacher, Head | Student performance |
| GET | `/api/analytics/batch/:name` | Teacher, Head | Batch performance |
| GET | `/api/analytics/academy` | Head | Academy-wide metrics |
| GET | `/api/analytics/platform` | Super Admin | Platform-wide metrics |

### 18.10 Reports

| Method | Endpoint | Role | Purpose |
|--------|---------|------|---------|
| GET | `/api/reports/monthly-progress` | Head | Monthly progress PDF |
| GET | `/api/reports/batch-comparison` | Head | Batch comparison Excel |
| GET | `/api/reports/parent-card/:student_id` | Head, Teacher | Parent report card PDF |
| GET | `/api/reports/compliance` | Head | Board compliance audit PDF |
| GET | `/api/reports/batch/:name` | Teacher | Batch performance sheet |
| GET | `/api/reports/platform` | Super Admin | Platform usage report |

### 18.11 Notifications

| Method | Endpoint | Role | Purpose |
|--------|---------|------|---------|
| GET | `/api/notifications` | All | List notifications |
| PUT | `/api/notifications/:id/read` | All | Mark as read |
| PUT | `/api/notifications/read-all` | All | Mark all as read |
| POST | `/api/notifications/send` | Admin, Head, Teacher | Send announcement |

---

## 19. SECURITY & DPDP COMPLIANCE

### 19.1 Security Measures

| Area | Implementation |
|------|---------------|
| Authentication | Supabase Auth with JWT + refresh tokens |
| Authorization | Row-Level Security on every table |
| Password | bcrypt hashing, min 8 chars, forced change on first login |
| Session | Auto-timeout after 30 minutes idle |
| OTP | SMS/Email OTP for password reset |
| Data Isolation | academy_id in JWT claims, validated server-side |
| Audit Trail | All critical actions logged in analytics_events |
| HTTPS | Enforced via Vercel deployment |
| Input Validation | Zod schemas on all API inputs |
| Rate Limiting | 100 requests/minute per user |
| CSRF Protection | SameSite cookies + CSRF tokens |

### 19.2 DPDP Act 2023 Compliance (India)

| Requirement | Implementation |
|------------|---------------|
| Consent | Consent checkbox on signup, stored with timestamp |
| Data Access | Students/parents can download their data via profile settings |
| Data Deletion | "Delete my account" removes all personal data within 72 hours |
| Data Minimization | Only collect necessary fields (no Aadhaar, no unnecessary PII) |
| Breach Notification | Alert system for unauthorized access attempts |
| Minor Protection | Parent consent for students under 18 (mandatory for all students) |
| Data Localization | All data stored on Indian servers (Supabase Mumbai region) |

---

## 20. DEPLOYMENT & SCALING PLAN

### 20.1 Deployment Architecture

| Component | Service | Region |
|-----------|---------|--------|
| Frontend | Vercel (Edge Network) | Mumbai CDN |
| Database | Supabase (PostgreSQL) | Mumbai (ap-south-1) |
| Storage | Supabase Storage | Mumbai |
| Auth | Supabase Auth | Mumbai |
| AI API | OpenAI API | US (via proxy) |
| Push Notifications | Firebase Cloud Messaging | Global |
| Monitoring | PostHog / Vercel Analytics | Global |

### 20.2 Scaling Milestones

| Phase | Academies | Students | Database Plan | Estimated Cost |
|-------|-----------|---------|--------------|---------------|
| Pilot | 1-2 | 100-300 | Supabase Free | $0/month |
| Early | 5-10 | 500-2,000 | Supabase Pro | $25/month |
| Growth | 10-50 | 2,000-10,000 | Supabase Pro + Vercel Pro | $75/month |
| Scale | 50-200 | 10,000-50,000 | Supabase Team + Vercel Enterprise | $300+/month |

### 20.3 Rollout Steps

1. **Week 1-2:** Set up Supabase project, create all tables, implement RLS policies
2. **Week 3-4:** Build auth system (login, role routing, password management)
3. **Week 5-8:** Build Super Admin panel + Academy onboarding
4. **Week 9-12:** Build Teacher panel (homework, timetable, review, doubts)
5. **Week 13-16:** Build Student panel (homework, tests, results, doubts, progress)
6. **Week 17-18:** Build Academy Head panel (dashboard, reports)
7. **Week 19-20:** Build notification system + report export engine
8. **Week 21-22:** Testing, bug fixes, performance optimization
9. **Week 23-24:** Pilot launch with 1-2 academies, collect feedback
10. **Week 25+:** Iterate based on feedback, scale to more academies

---

## END OF SRS DOCUMENT

**Version:** 2.0  
**Total Pages:** 20 sections  
**Total Screens Designed:** 20+ (interactive preview available)  
**Live UI Preview:** https://you-can-ui-designs-lhlngqsi.devinapps.com  
**Database Tables:** 14  
**API Endpoints:** 50+  
**Estimated Build Time:** 20-24 weeks (solo developer) / 12-16 weeks (2-3 person team)

**Next Steps:**
1. Review this complete SRS document
2. Approve the tech stack and UI designs
3. Begin Phase 1: Database setup + Auth system
4. Pilot with 1 academy for feedback
