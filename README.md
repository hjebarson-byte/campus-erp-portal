# CampusERP — College Management & Student Information System

A full-stack College ERP and Student Information System built with **React** and **Django REST Framework**, featuring real-time attendance tracking, CBCS grade calculation, digital fee ledgers, and role-based portals for students, faculty, and administrators.

---

## 🌟 Key Features

### 🎓 Student Portal
- **Academic Dashboard**: High-level summary of aggregate attendance, current CGPA, fee status, today's schedule, and pending coursework.
- **Attendance Register & Tracker**: Subject-wise dynamic attendance percentage, shortfall alerts, and statutory (75%) margin calculations.
- **Grades & Transcripts**: Semester-wise SGPA & cumulative CGPA calculations based on university CBCS grade scale.
- **Continuous Assessment & Coursework**: Assignment submissions and project link uploads with real-time status tracking.
- **Fee Ledger & Digital Receipts**: Voucher tracking, online payment simulation, and printable transaction receipts.
- **Leave & On-Duty Applications**: Apply for Medical Leave or On-Duty exemptions with reason and date range verification.
- **Institutional Circulars**: Filterable noticeboard with pinned urgent alerts, exam notifications, and campus event broadcasts.

### 👨‍🏫 Faculty Workspace
- **Attendance Register**: Mark daily class attendance (Present / Absent) with instant student record updates.
- **Grade Management**: Enter and update internal and end-semester marks.
- **Circular Broadcasting**: Publish announcements directly to the student noticeboard.
- **Leave Application Review**: Approve or reject student leave requests with verification notes.

### 🏛️ Administration & Registry
- **Central Registry (SIS)**: Enrol new students, assign roll numbers, departments, and generate initial semester fee records.
- **Student Roster**: Directory of all registered students with profile management.
- **Academic Catalog**: Departmental courses, credit weights, and faculty-in-charge mapping.
- **System Metrics**: Real-time stats on enrolled students, faculty count, courses, and total fee realization.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide React, Single Unified CSS Design System (Dark/Light mode & custom accent palettes)
- **Backend**: Python 3.12, Django 5, Django REST Framework, Django CORS Headers
- **Database**: MySQL (`college_erp_db`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MySQL Server (running on port 3306)

### 1. Database Setup
Ensure MySQL is running and create the database:
```sql
CREATE DATABASE college_erp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup
```bash
cd Backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MySQL credentials

python setup_mysql.py   # Runs migrations and seeds initial university sample data
python manage.py runserver 0.0.0.0:8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
