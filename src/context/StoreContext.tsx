import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { sanitizeObject } from '../utils/security';
import { normalizeWhatsAppNumber, MESSAGE_TEMPLATES } from '../utils/whatsapp';
import { supabase } from '../lib/supabase';

export interface AcademicRecord {
    degree: string;
    major: string;
    marksObtained: string;
    totalMarks: string;
    percentage: string;
    passingYear: string;
    board: string;
}

export interface Payment {
    id: string;
    amount: number;
    date: string;
    method: 'Cash' | 'Bank Transfer' | 'Cheque';
    description: string;
}

export interface Notification {
    id: string;
    studentId: string;
    studentName: string;
    type: 'Attendance' | 'Fee' | 'General';
    message: string;
    status: 'Sent' | 'Pending' | 'Failed' | 'Queued';
    date: string;
    targetNumber: string;
}

export interface Discount {
    id: string;
    amount: number;
    reason: string;
    date: string;
}


export interface Student {
    id: string;
    name: string;
    class: string;
    status: 'Active' | 'Warning' | 'Inactive';
    performance: string;
    avatar: string;
    feesPaid: number;
    feesTotal: number;
    monthlyTuition?: number;
    // Admission Form Fields
    fatherName?: string;
    fatherOccupation?: string;
    monthlyIncome?: string;
    address?: string;
    dob?: string;
    contactSelf?: string;
    contactFather?: string;
    gender?: string;
    religion?: string;
    nationality?: string;
    cnic?: string;
    discipline?: string;
    email?: string;
    campus?: string;
    isOrphan?: string;
    whatsappNumber?: string;
    admissionDate?: string;
    admissionFees?: number;
    monthlyFees?: number;
    securityFees?: number;
    miscellaneousCharges?: number;
    academicRecords?: AcademicRecord[];
    documents?: Record<string, string>;
    manualId?: string;
    paymentHistory?: Payment[];
    discounts?: Discount[];
}

export interface Teacher {
    id: string;
    name: string;
    subject: string;
    classes: string[];
    status: 'Active' | 'On Leave';
    avatar: string;
    // Teacher Details
    cnic?: string;
    address?: string;
    dob?: string;
    gender?: string;
    religion?: string;
    nationality?: string;
    phone?: string;
    email?: string;
    qualification?: string;
    experience?: string;
    joiningDate?: string;
    campus?: string;
    whatsappNumber?: string;
    employmentType?: string;
    fatherName?: string;
    husbandName?: string;
    maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    baseSalary?: number;
    // Login & Access Control
    username?: string;
    password?: string;
    permissions?: string[];
    role?: string;
    inchargeClass?: string;
    documents?: Record<string, string>;
}

export interface SalarySlip {
    id: string;
    teacherId: string;
    month: string;
    year: number;
    baseSalary: number;
    allowances: { type: string; amount: number }[];
    deductions: { type: string; amount: number }[];
    bonus?: number;
    netSalary: number;
    status: 'Paid' | 'Pending';
    paidDate?: string;
    paymentMethod?: 'Cash' | 'Bank Transfer' | 'Cheque';
}

export interface Expense {
    id: string;
    title: string;
    category: 'Utilities' | 'Rent' | 'Stationery' | 'Maintenance' | 'Miscellaneous' | 'Events';
    amount: number;
    date: string;
    description?: string;
}


export interface SchoolSettings {
    schoolName: string;
    subTitle: string;
    location: string;
    logo1: string | null;
    logo2: string | null;
    academicSession: string;
    effectiveDate: string;
    aiApiKey?: string;
    aiTone?: 'Professional' | 'Polite' | 'Strict' | 'Supportive';
    primaryColor?: string;
    dashboardTheme?: 'Light' | 'Dark' | 'Premium';
    themeColors?: {
        primary: string;
        secondary: string;
        accent: string;
        borderRadius?: string;
        glassIntensity?: string;
    };
    adminUsername?: string;
    adminPassword?: string;
}

export interface Campus {
    id: string;
    name: string;
    location: string;
    contact?: string;
    principalName?: string;
    email?: string;
    idPrefix?: string;
    type?: 'School' | 'College' | 'Both';
    status?: 'Active' | 'Inactive';
    capacity?: number;
}

export interface AuditLog {
    id: string;
    user: string;
    action: string;
    timestamp: string;
    details: string;
    type: 'Security' | 'Academic' | 'Financial' | 'System';
}

export interface AttendanceRecord {
    studentId: string;
    status: 'Present' | 'Absent' | 'Late' | 'Leave';
}

export interface Attendance {
    date: string;
    class: string;
    campus: string;
    records: AttendanceRecord[];
}

export interface TimetableSlot {
    subject: string;
    teacherId: string;
    startTime: string;
    endTime: string;
    isElective?: boolean;
    secondarySubject?: string;
    secondaryTeacherId?: string;
    tertiarySubject?: string;
    tertiaryTeacherId?: string;
}

export interface PeriodTime {
    label: string;
    start: string;
    end: string;
    friStart: string;
    friEnd: string;
    duration: string;
    isBreak?: boolean;
}

export interface WeeklyTimetable {
    [day: string]: TimetableSlot[];
}

export interface Exam {
    id: string;
    name: string;
    classes: string[];
    date: string;
    status: 'In Progress' | 'Finalized';
    createdAt: string;
    session?: string;
}

export interface StudentExamResult {
    studentId: string;
    examId: string;
    className: string;
    marks: Record<string, { obtained: number; total: number }>; // subject -> { obtained, total }
    totalObtained: number;
    totalPossible: number;
    percentage: number;
    grade: string;
    position: number | null; // Class Position
    schoolPosition?: number | null;
    campusPosition?: number | null;
    remarks?: string;
}

interface AppState {
    students: Student[];
    teachers: Teacher[];
    settings: SchoolSettings;
    attendance: Attendance[];
    feeStructure: Record<string, number>;
    classes: string[];
    periodSettings: Record<string, PeriodTime[]>;
    updatePeriodSettings: (settings: Record<string, PeriodTime[]>) => void;
    addClass: (name: string, fee: number) => void;
    updateClass: (oldName: string, newName: string, fee: number) => void;
    deleteClass: (name: string) => void;
    addStudent: (s: Partial<Student>) => Promise<void>;
    updateStudent: (id: string, updates: Partial<Student>) => void;
    deleteStudent: (id: string) => void;
    addTeacher: (t: Partial<Teacher>) => void;
    updateTeacher: (id: string, updates: Partial<Teacher>) => void;
    deleteTeacher: (id: string) => void;
    updateSettings: (s: Partial<SchoolSettings>) => void;
    markAttendance: (a: Attendance) => void;
    updateFeeStructure: (updates: Record<string, number>) => void;
    classSubjects: Record<string, string[]>;
    classInCharge: Record<string, string>;
    subjectTeachers: Record<string, Record<string, string>>; // Class -> { Subject: TeacherId }
    timetables: Record<string, WeeklyTimetable>; // Class -> WeeklyTimetable
    subjectTotalMarks: Record<string, Record<string, number>>;
    updateClassSubjects: (className: string, subjects: string[]) => void;
    updateClassSubjectMarks: (className: string, marks: Record<string, number>) => void;
    updateClassInCharge: (className: string, teacherId: string) => void;
    assignSubjectTeacher: (className: string, subject: string, teacherId: string) => void;
    updateTimetable: (className: string, timetable: WeeklyTimetable) => void;
    updateAllTimetables: (newTimetables: Record<string, WeeklyTimetable>) => void;
    promoteStudents: (fromClass: string, toClass: string) => void;
    bulkUpdateStudents: (studentIds: string[], updates: Partial<Student>) => void;
    exams: Exam[];
    examResults: StudentExamResult[];
    addExam: (exam: Partial<Exam>) => void;
    updateExam: (id: string, updates: Partial<Exam>) => void;
    deleteExam: (id: string) => void;
    inputMarks: (examId: string, className: string, studentId: string, subject: string, obtained: number | string, total: number) => void;
    finalizeResults: (examId: string, className: string) => void;
    currentUser: { id: string, name: string, role: string, permissions?: string[], inchargeClass?: string } | null;
    login: (id: string, password?: string, role?: string) => boolean;
    logout: () => void;
    notifications: Notification[];
    sendNotification: (studentId: string, type: 'Attendance' | 'Fee' | 'General', message: string, media?: string, filename?: string) => void;
    triggerFeeReminders: (className?: string, studentId?: string) => void;
    auditLogs: AuditLog[];
    addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;

    // Finance System
    expenses: Expense[];
    salarySlips: SalarySlip[];
    addExpense: (e: Omit<Expense, 'id'>) => void;
    deleteExpense: (id: string) => void;
    generateSalarySlips: (month: string, year: number) => void;
    updateSalarySlip: (id: string, updates: Partial<SalarySlip>) => void;

    // Backup & Restore
    importBackup: (data: any) => Promise<boolean>;

    // Campus Management
    campuses: Campus[];
    addCampus: (c: Omit<Campus, 'id'>) => void;
    updateCampus: (id: string, updates: Partial<Campus>) => void;
    deleteCampus: (id: string) => void;
}

const StoreContext = createContext<AppState | undefined>(undefined);

const INITIAL_STUDENTS: Student[] = [
    {
        id: 'STU-001',
        name: 'Zainab Ahmed',
        class: 'Grade 10-A',
        status: 'Active',
        performance: '92%',
        avatar: 'Z',
        feesPaid: 2400,
        feesTotal: 3000,
        whatsappNumber: '03001234567',
        contactFather: '03001234567'
    },
    {
        id: 'STU-002',
        name: 'Hamza Khan',
        class: 'Grade 12-C',
        status: 'Active',
        performance: '88%',
        avatar: 'H',
        feesPaid: 3000,
        feesTotal: 3000,
        whatsappNumber: '03007654321',
        contactFather: '03007654321'
    },
];

const INITIAL_TEACHERS: Teacher[] = [
    { id: 'TCH-ERUM', name: 'Ms. Erum', subject: 'English', classes: ['Class 1', '1st Year', '2nd Year'], status: 'Active', avatar: 'E' },
    { id: 'TCH-RAZIA', name: 'Ms. Razia', subject: 'Urdu & Islamiat', classes: ['Class 1', 'Class 2', 'Class 3'], status: 'Active', avatar: 'R' },
    { id: 'TCH-IRUM', name: 'Ms. Irum', subject: 'English', classes: ['Class 1', 'Class 2', 'Class 4'], status: 'Active', avatar: 'I' },
    { id: 'TCH-ZARA', name: 'Ms. Zara', subject: 'Science', classes: ['Class 1', 'Class 5', '6th Boys', '9th S Boys', '1st Year Girls', '2nd Year Girls'], status: 'Active', avatar: 'Z' },
    { id: 'TCH-MARIA', name: 'Ms. Maria', subject: 'Math', classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], status: 'Active', avatar: 'M' },
    { id: 'TCH-MARYAM', name: 'Ms. Maryam', subject: 'Computer/SST', classes: ['Class 2', 'Class 3', 'Class 4'], status: 'Active', avatar: 'M' },
    { id: 'TCH-AIMEN', name: 'Ms. Aimen', subject: 'Science', classes: ['Class 2'], status: 'Active', avatar: 'A' },
    { id: 'TCH-AMNA', name: 'Ms. Amna', subject: 'English/Science', classes: ['Class 3', 'Class 5', '7th Boys', '6th Girls', '7th Girls'], status: 'Active', avatar: 'A' },
    { id: 'TCH-ANEELA', name: 'Ms. Aneela', subject: 'Islamiat', classes: ['Class 4', 'Class 5', '6th Boys', '7th Boys', '6th Girls', '7th Girls'], status: 'Active', avatar: 'A' },
    { id: 'TCH-SAIMA', name: 'Ms. Saima', subject: 'Science/Physics', classes: ['Class 4', '7th Boys', '9th S Boys', 'Girls 9th'], status: 'Active', avatar: 'S' },
    { id: 'TCH-SAMRA', name: 'Ms. Samra', subject: 'Urdu', classes: ['Class 4', 'Class 5', '6th Boys', '7th Boys', '6th Girls', '7th Girls'], status: 'Active', avatar: 'S' },
    { id: 'TCH-ALEENA', name: 'Ms. Aleena', subject: 'Computer', classes: ['Class 4', 'Class 5'], status: 'Active', avatar: 'A' },
    { id: 'TCH-FIZA', name: 'Ms. Fiza', subject: 'Biology/Chemistry', classes: ['Class 5', '9th J Boys', '9th S Boys', '7th Girls', 'Girls 9th'], status: 'Active', avatar: 'F' },
    { id: 'TCH-ALISHBA', name: 'Ms. Alishba A', subject: 'English', classes: ['6th Boys'], status: 'Active', avatar: 'A' },
    { id: 'TCH-HAMID', name: 'Mr. Hamid', subject: 'Computer', classes: ['6th Boys', '7th Boys', '9th J Boys', '9th S Boys'], status: 'Active', avatar: 'H' },
    { id: 'TCH-NIMRAH', name: 'Ms. Nimrah', subject: 'English/SST', classes: ['6th Boys', '9th S Boys', '10th Boys', '1st Year Boys', '6th Girls', 'Girls 9th'], status: 'Active', avatar: 'N' },
    { id: 'TCH-SMARYAM', name: 'Ms. S Maryam', subject: 'Math', classes: ['6th Boys', '9th S Boys', '10th Boys', '7th Girls', 'Girls 9th'], status: 'Active', avatar: 'S' },
    { id: 'TCH-USMAN', name: 'Mr. Usman', subject: 'Science/Chemistry', classes: ['7th Boys', '10th Boys', '1st Year Boys', '2nd Year Boys', 'Girls 9th', '1st Year Girls', '2nd Year Girls'], status: 'Active', avatar: 'U' },
    { id: 'TCH-QARI', name: 'Qari Sb', subject: 'Islamiat', classes: ['9th J Boys', '9th S Boys', '10th Boys', '1st Year Boys', 'Girls 9th', '1st Year Girls'], status: 'Active', avatar: 'Q' },
    { id: 'TCH-MANSOOR', name: 'Mr. Mansoor', subject: 'Physics/Math', classes: ['9th J Boys', '10th Boys', '1st Year Boys', '6th Girls', '1st Year Girls'], status: 'Active', avatar: 'M' },
    { id: 'TCH-UZMA', name: 'Ms. Uzma', subject: 'Urdu', classes: ['9th J Boys', '10th Boys', '1st Year Boys', '2nd Year Boys', '1st Year Girls', '2nd Year Girls'], status: 'Active', avatar: 'U' },
    { id: 'TCH-IRUMS', name: 'Ms. Irum S', subject: 'Urdu/PST', classes: ['9th S Boys', '10th Boys', '2nd Year Boys', 'Girls 9th', '2nd Year Girls'], status: 'Active', avatar: 'I' },
    { id: 'TCH-SURIYA', name: 'Ms. Suriya', subject: 'Math', classes: ['7th Boys', '1st Year Boys', '2nd Year Boys', '7th Girls', '1st Year Girls', '2nd Year Girls'], status: 'Active', avatar: 'S' },
    { id: 'TCH-MUBEEN', name: 'Mr. Mubeen', subject: 'Computer', classes: ['1st Year Boys', '2nd Year Boys', '10th Girls', '1st Year Girls', '2nd Year Girls'], status: 'Active', avatar: 'M' },
    { id: 'TCH-ABASIT', name: 'Mr. A Basit', subject: 'Physics', classes: ['2nd Year Boys', '2nd Year Girls'], status: 'Active', avatar: 'A' },
];


const INITIAL_SETTINGS: SchoolSettings = {
    schoolName: "PIONEER'S SUPERIOR",
    subTitle: "Institute Of Higher Secondary Education, Attock",
    location: "Mirza Road, Attock City",
    logo1: "/logo1.png",
    logo2: "/logo2.png",
    academicSession: "2025-2026",
    effectiveDate: new Date().toLocaleDateString(),
    themeColors: {
        primary: '#003366',
        secondary: '#0ea5e9',
        accent: '#fbbf24',
        borderRadius: '2.5rem',
        glassIntensity: '0.98'
    }
};

const INITIAL_CAMPUSES: Campus[] = [
    {
        id: 'CAMP-MANZOOR',
        name: 'Dr Manzoor Campus',
        location: 'Attock City',
        idPrefix: 'MH',
        principalName: 'Dr. Mansoor',
        status: 'Active',
        type: 'Both'
    },
    {
        id: 'CAMP-SHAMIM',
        name: 'Shamim Campus',
        location: 'Attock City',
        idPrefix: 'SF',
        principalName: 'Ms. Shamim',
        status: 'Active',
        type: 'School'
    },
    {
        id: 'CAMP-SHAWAR',
        name: 'Shawar Campus',
        location: 'Attock City',
        idPrefix: 'SN',
        principalName: 'Mr. Shawar',
        status: 'Active',
        type: 'College'
    }
];

const INITIAL_FEE_STRUCTURE: Record<string, number> = {
    'PG': 2500,
    'Nursery': 2500,
    'KG': 2500,
    'Class 1': 3000,
    'Class 2': 3000,
    'Class 3': 3000,
    'Class 4': 3000,
    'Class 5': 3000,
    'Class 6 (Boys)': 3500,
    'Class 6 (Girls)': 3500,
    'Class 7 (Boys)': 3500,
    'Class 7 (Girls)': 3500,
    'Class 8': 3500,
    'Class 9th J (Boys)': 4000,
    'Class 9th S (Boys)': 4000,
    'Class 9th (Girls)': 4000,
    'Class 10th (Boys)': 4500,
    'Class 10th (Girls)': 4500,
    '1st Year (Boys)': 5500,
    '1st Year (Girls)': 5500,
    '2nd Year (Boys)': 5500,
    '2nd Year (Girls)': 5500,
    'General': 3000
};

const DEFAULT_SCHOOL_CLASSES = [
    'PG', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6 (Boys)', 'Class 6 (Girls)', 'Class 7 (Boys)', 'Class 7 (Girls)', 'Class 8',
    'Class 9th J (Boys)', 'Class 9th S (Boys)', 'Class 9th (Girls)', 'Class 10th (Boys)', 'Class 10th (Girls)'
];
const DEFAULT_COLLEGE_CLASSES = ['1st Year (Boys)', '1st Year (Girls)', '2nd Year (Boys)', '2nd Year (Girls)'];

export const DEFAULT_PERIODS: PeriodTime[] = [
    { label: 'ASSM', start: '08:00', end: '08:15', duration: '15 Min', friStart: '07:20', friEnd: '07:35' },
    { label: '1', start: '08:15', end: '09:00', duration: '45 Min', friStart: '07:35', friEnd: '08:10' },
    { label: '2', start: '09:00', end: '09:45', duration: '45 Min', friStart: '08:10', friEnd: '08:45' },
    { label: '3', start: '09:45', end: '10:30', duration: '45 Min', friStart: '08:45', friEnd: '09:20' },
    { label: '4', start: '10:30', end: '11:15', duration: '45 Min', friStart: '09:20', friEnd: '09:55' },
    { label: 'BRK', start: '11:15', end: '11:35', duration: '20 Min', friStart: '09:55', friEnd: '10:10', isBreak: true },
    { label: '6', start: '11:35', end: '12:20', duration: '45 Min', friStart: '10:10', friEnd: '10:45' },
    { label: '7', start: '12:20', end: '01:05', duration: '45 Min', friStart: '10:45', friEnd: '11:20' }
];

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [students, setStudents] = useState<Student[]>(() => {
        const saved = localStorage.getItem('edunova_students');
        return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    });

    const [teachers, setTeachers] = useState<Teacher[]>(() => {
        const saved = localStorage.getItem('edunova_teachers');
        return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
    });

    useEffect(() => {
        let isMounted = true;
        const fetchInitialData = async () => {
            try {
                // Fetch all data from Supabase
                const [stuRes, tchRes, appDataRes] = await Promise.all([
                    supabase.from('students').select('*'),
                    supabase.from('teachers').select('*'),
                    supabase.from('app_data').select('*')
                ]);

                if (!isMounted) return;

                // Helper to fix legacy doubled quotes ('' -> ') and merge records
                const cleanLegacy = (obj: any): any => {
                    if (typeof obj === 'string') return obj.replace(/''/g, "'");
                    if (Array.isArray(obj)) return obj.map(cleanLegacy);
                    if (obj !== null && typeof obj === 'object') {
                        const next: any = {};
                        for (const k in obj) next[k] = cleanLegacy(obj[k]);
                        return next;
                    }
                    return obj;
                };

                // Source of truth: Supabase. Overwrite local state to prevent old/deleted data from resurrecting.
                if (stuRes.data && !stuRes.error) {
                    const cloudStudents = cleanLegacy(stuRes.data as Student[]);
                    setStudents(cloudStudents);
                }
                if (tchRes.data && !tchRes.error) {
                    const cloudTeachers = cleanLegacy(tchRes.data as Teacher[]);
                    setTeachers(cloudTeachers);
                }

                if (appDataRes.data && !appDataRes.error) {
                    const appDataMap = new Map(appDataRes.data.map(item => [item.id, cleanLegacy(item.data)]));

                    if (appDataMap.has('settings')) setSettings(prev => ({ ...prev, ...(appDataMap.get('settings') || {}) }));
                    if (appDataMap.has('attendance')) setAttendance(appDataMap.get('attendance'));
                    if (appDataMap.has('feeStructure')) setFeeStructure(appDataMap.get('feeStructure'));
                    if (appDataMap.has('classes')) setClasses(appDataMap.get('classes'));
                    if (appDataMap.has('periodSettings')) setPeriodSettings(appDataMap.get('periodSettings'));
                    if (appDataMap.has('classSubjects')) setClassSubjects(appDataMap.get('classSubjects'));
                    if (appDataMap.has('subjectTotalMarks')) setSubjectTotalMarks(appDataMap.get('subjectTotalMarks'));
                    if (appDataMap.has('classInCharge')) setClassInCharge(appDataMap.get('classInCharge'));
                    if (appDataMap.has('subjectTeachers')) setSubjectTeachers(appDataMap.get('subjectTeachers'));
                    if (appDataMap.has('timetables')) setTimetables(appDataMap.get('timetables'));
                    if (appDataMap.has('exams')) setExams(appDataMap.get('exams'));
                    if (appDataMap.has('examResults')) setExamResults(appDataMap.get('examResults'));
                    if (appDataMap.has('notifications')) setNotifications(appDataMap.get('notifications'));
                    if (appDataMap.has('auditLogs')) setAuditLogs(appDataMap.get('auditLogs'));
                    if (appDataMap.has('campuses')) setCampuses(appDataMap.get('campuses'));
                    if (appDataMap.has('expenses')) setExpenses(appDataMap.get('expenses'));
                    if (appDataMap.has('salarySlips')) setSalarySlips(appDataMap.get('salarySlips'));
                }

                // If we reach here without throwing, mark fetch as complete
                setIsInitialLoading(false);
            } catch (err) {
                console.error("CRITICAL: Supabase connection failed. App is in Local-Only mode.", err);
                // Allow the app to proceed with local data if cloud fails
                setIsInitialLoading(false);
            }
        };
        fetchInitialData();
        return () => { isMounted = false; };
    }, []);


    const [settings, setSettings] = useState<SchoolSettings>(() => {
        const saved = localStorage.getItem('edunova_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...INITIAL_SETTINGS,
                ...parsed,
                logo1: parsed.logo1 || INITIAL_SETTINGS.logo1,
                logo2: parsed.logo2 || INITIAL_SETTINGS.logo2
            };
        }
        return INITIAL_SETTINGS;
    });

    const [attendance, setAttendance] = useState<Attendance[]>(() => {
        const saved = localStorage.getItem('edunova_attendance');
        return saved ? JSON.parse(saved) : [];
    });

    const [feeStructure, setFeeStructure] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('edunova_fees');
        return saved ? JSON.parse(saved) : INITIAL_FEE_STRUCTURE;
    });

    const [classSubjects, setClassSubjects] = useState<Record<string, string[]>>(() => {
        const saved = localStorage.getItem('edunova_class_subjects');
        if (saved) return JSON.parse(saved);

        return {
            'PG': ['English', 'Urdu', 'Math', 'GK'],
            'Nursery': ['English', 'Urdu', 'Math', 'GK'],
            'KG': ['English', 'Urdu', 'Math', 'GK'],
            'Class 1': ['English', 'Urdu', 'Computer', 'Science', 'Math', 'Islamiat'],
            'Class 2': ['Urdu', 'English', 'Islamiat', 'Math', 'Computer', 'Science'],
            'Class 3': ['Science', 'Math', 'English', 'Urdu', 'Islamiat', 'Computer'],
            'Class 4': ['Math', 'Islamiat', 'Science', 'English', 'Urdu', 'Computer', 'S.S.T'],
            'Class 5': ['Islamiat', 'Urdu', 'English', 'SST', 'Math', 'Science', 'Computer'],
            'Class 6 (Boys)': ['Science', 'English', 'Islamiat', 'Computer', 'S.S.T', 'Math', 'Urdu'],
            'Class 6 (Girls)': ['Science', 'English', 'Islamiat', 'Computer', 'S.S.T', 'Math', 'Urdu'],
            'Class 7 (Boys)': ['Science', 'Computer', 'Urdu', 'Islamiat', 'English', 'S.S.T', 'Math'],
            'Class 7 (Girls)': ['Science', 'Computer', 'Urdu', 'Islamiat', 'English', 'S.S.T', 'Math'],
            'Class 9th J (Boys)': ['Biology', 'Computer', 'Islamiat', 'Physics', 'Urdu', 'Chemistry', 'Math', 'English'],
            'Class 9th S (Boys)': ['Biology', 'Computer', 'Islamiat', 'Physics', 'Urdu', 'Chemistry', 'Math', 'English'],
            'Class 9th (Girls)': ['Biology', 'Computer', 'Islamiat', 'Physics', 'Urdu', 'Chemistry', 'Math', 'English'],
            'Class 10th (Boys)': ['Islamiat', 'Chemistry', 'Urdu', 'Physics', 'Math', 'English', 'Biology', 'P.St'],
            'Class 10th (Girls)': ['Islamiat', 'Chemistry', 'Urdu', 'Physics', 'Math', 'English', 'Biology', 'P.St'],
            '1st Year (Boys)': ['Urdu', 'Physics', 'Islamiat', 'Math', 'Biology', 'Computer', 'Chemistry', 'English'],
            '1st Year (Girls)': ['Urdu', 'Physics', 'Islamiat', 'Math', 'Biology', 'Computer', 'Chemistry', 'English'],
            '2nd Year (Boys)': ['Physics', 'Urdu', 'Math', 'Biology', 'Computer', 'P.St', 'English', 'Chemistry'],
            '2nd Year (Girls)': ['Physics', 'Urdu', 'Math', 'Biology', 'Computer', 'P.St', 'English', 'Chemistry']
        };
    });

    const [classInCharge, setClassInCharge] = useState<Record<string, string>>(() => {
        const saved = localStorage.getItem('edunova_class_incharge');
        return saved ? JSON.parse(saved) : {};
    });

    const [subjectTeachers, setSubjectTeachers] = useState<Record<string, Record<string, string>>>(() => {
        const saved = localStorage.getItem('edunova_subject_teachers');
        const initial = {
            'Class 1': { 'English': 'TCH-ERUM', 'Urdu & Islamiat': 'TCH-RAZIA', 'Computer': 'TCH-IRUM', 'Science': 'TCH-ZARA', 'Math': 'TCH-MARIA' },
            'Class 2': { 'Urdu & Islamiat': 'TCH-RAZIA', 'English': 'TCH-IRUM', 'Math': 'TCH-MARIA', 'Computer': 'TCH-MARYAM', 'Science': 'TCH-AIMEN' },
            'Class 3': { 'Science': 'TCH-AMNA', 'Math & English': 'TCH-MARIA', 'Urdu & Islamiat': 'TCH-RAZIA', 'Computer': 'TCH-MARYAM' },
            'Class 4': { 'Math': 'TCH-MARIA', 'Islamiat': 'TCH-ANEELA', 'Science': 'TCH-SAIMA', 'English': 'TCH-IRUM', 'Urdu': 'TCH-SAMRA', 'Computer': 'TCH-ALEENA', 'S.S.T': 'TCH-MARYAM' },
            'Class 5': { 'Islamiat': 'TCH-ANEELA', 'Urdu': 'TCH-SAMRA', 'English': 'TCH-AMNA', 'S.S.T': 'TCH-FIZA', 'Math': 'TCH-MARIA', 'Science': 'TCH-ZARA', 'Computer': 'TCH-ALEENA' },
            'Class 6 (Boys)': { 'Science': 'TCH-ZARA', 'English': 'TCH-ALISHBA', 'Islamiat': 'TCH-ANEELA', 'Computer': 'TCH-HAMID', 'S.S.T': 'TCH-NIMRAH', 'Math': 'TCH-SMARYAM', 'Urdu': 'TCH-SAMRA' },
            'Class 7 (Boys)': { 'Science': 'TCH-USMAN', 'Computer': 'TCH-HAMID', 'Urdu': 'TCH-SAMRA', 'Islamiat': 'TCH-ANEELA', 'English': 'TCH-AMNA', 'S.S.T': 'TCH-SAIMA', 'Math': 'TCH-SURIYA' },
            'Class 9th J (Boys)': { 'Biology & Chemistry': 'TCH-FIZA', 'Computer': 'TCH-HAMID', 'Islamiat': 'TCH-QARI', 'Physics & Math': 'TCH-MANSOOR', 'Urdu': 'TCH-UZMA' },
            'Class 9th S (Boys)': { 'English': 'TCH-NIMRAH', 'Chemistry': 'TCH-ZARA', 'Biology': 'TCH-FIZA', 'Computer': 'TCH-HAMID', 'Islamiat': 'TCH-QARI', 'Physics': 'TCH-SAIMA', 'Urdu': 'TCH-IRUMS', 'Math': 'TCH-SMARYAM' },
            'Class 10th (Boys)': { 'Islamiat': 'TCH-QARI', 'Chemistry': 'TCH-USMAN', 'Urdu': 'TCH-UZMA', 'Physics': 'TCH-MANSOOR', 'Math': 'TCH-SMARYAM', 'English': 'TCH-NIMRAH', 'PST': 'TCH-IRUMS' },
            '1st Year (Boys)': { 'Urdu': 'TCH-UZMA', 'Physics': 'TCH-MANSOOR', 'Islamiat': 'TCH-QARI', 'Math': 'TCH-SURIYA', 'Computer': 'TCH-MUBEEN', 'English': 'TCH-ERUM', 'Civics/Islamiat E': 'TCH-IRUMS', 'Education': 'TCH-NIMRAH', 'Chemistry': 'TCH-USMAN' },
            '2nd Year (Boys)': { 'Physics': 'TCH-ABASIT', 'Urdu': 'TCH-UZMA', 'Math': 'TCH-SURIYA', 'Biology': 'TCH-ZARA', 'Computer': 'TCH-MUBEEN', 'PST': 'TCH-IRUMS', 'English': 'TCH-ERUM', 'Chemistry': 'TCH-USMAN' },
            'Class 6 (Girls)': { 'Urdu': 'TCH-SAMRA', 'Math': 'TCH-SMARYAM', 'S.S.T': 'TCH-NIMRAH', 'Science': 'TCH-ZARA', 'Islamiat': 'TCH-ANEELA', 'English': 'TCH-AMNA', 'Computer': 'TCH-MANSOOR' },
            'Class 7 (Girls)': { 'S.S.T': 'TCH-SAIMA', 'Science': 'TCH-FIZA', 'Computer': 'TCH-SMARYAM', 'English': 'TCH-AMNA', 'Math': 'TCH-SURIYA', 'Urdu': 'TCH-SAMRA', 'Islamiat': 'TCH-ANEELA' },
            'Class 9th (Girls)': { 'Math': 'TCH-SMARYAM', 'English': 'TCH-NIMRAH', 'Chemistry': 'TCH-USMAN', 'Physics': 'TCH-SAIMA', 'Islamiat': 'TCH-QARI', 'Biology': 'TCH-FIZA', 'Urdu': 'TCH-IRUMS' },
            'Class 10th (Girls)': { 'Computer': 'TCH-MUBEEN' },
            '1st Year (Girls)': { 'Math': 'TCH-SURIYA', 'Biology': 'TCH-ZARA', 'Computer': 'TCH-MUBEEN', 'Islamiat': 'TCH-QARI', 'Chemistry': 'TCH-USMAN', 'Physics': 'TCH-MANSOOR', 'Urdu': 'TCH-UZMA', 'English': 'TCH-ERUM' },
            '2nd Year (Girls)': { 'Physics': 'TCH-ABASIT', 'Math': 'TCH-SURIYA', 'Biology': 'TCH-ZARA', 'Computer': 'TCH-MUBEEN', 'PST': 'TCH-IRUMS', 'English': 'TCH-ERUM', 'Chemistry': 'TCH-USMAN', 'Urdu': 'TCH-UZMA' }
        };

        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge defaults with saved to make sure new classes have subjects
            return { ...initial, ...parsed };
        }
        return initial;
    });

    useEffect(() => {
        // One-time sync to ensure classes state matches our new structure
        const synced = localStorage.getItem('curriculum_synced_v7');
        if (!synced) {
            setClasses([...DEFAULT_SCHOOL_CLASSES, ...DEFAULT_COLLEGE_CLASSES]);
            localStorage.setItem('curriculum_synced_v7', 'true');
        }
    }, []);

    const [timetables, setTimetables] = useState<Record<string, WeeklyTimetable>>(() => {
        const saved = localStorage.getItem('edunova_timetables');
        return saved ? JSON.parse(saved) : {};
    });

    const [subjectTotalMarks, setSubjectTotalMarks] = useState<Record<string, Record<string, number>>>(() => {
        const saved = localStorage.getItem('edunova_subject_total_marks');
        return saved ? JSON.parse(saved) : {};
    });

    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
        const saved = localStorage.getItem('edunova_audit_logs');
        return saved ? JSON.parse(saved) : [];
    });

    const [classes, setClasses] = useState<string[]>(() => {
        const saved = localStorage.getItem('edunova_classes');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        return [...DEFAULT_SCHOOL_CLASSES, ...DEFAULT_COLLEGE_CLASSES];
    });

    const [periodSettings, setPeriodSettings] = useState<Record<string, PeriodTime[]>>(() => {
        const saved = localStorage.getItem('edunova_period_settings_v2');
        if (saved) return JSON.parse(saved);

        const oldSaved = localStorage.getItem('edunova_period_settings');
        const oldPeriods = oldSaved ? JSON.parse(oldSaved) : DEFAULT_PERIODS;

        return {
            primary: [...oldPeriods],
            boys: [...oldPeriods],
            girls: [...oldPeriods]
        };
    });

    const [exams, setExams] = useState<Exam[]>(() => {
        const saved = localStorage.getItem('edunova_exams_v2'); // Changed from edunova_exams to match new consolidated key
        return saved ? JSON.parse(saved) : [];
    });

    const [examResults, setExamResults] = useState<StudentExamResult[]>(() => {
        const saved = localStorage.getItem('edunova_exam_results_v2');
        return saved ? JSON.parse(saved) : [];
    });

    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem('edunova_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    const [campuses, setCampuses] = useState<Campus[]>(() => {
        const saved = localStorage.getItem('edunova_campuses');
        return saved ? JSON.parse(saved) : INITIAL_CAMPUSES;
    });

    const [expenses, setExpenses] = useState<Expense[]>(() => {
        const saved = localStorage.getItem('edunova_expenses');
        return saved ? JSON.parse(saved) : [];
    });

    const [salarySlips, setSalarySlips] = useState<SalarySlip[]>(() => {
        const saved = localStorage.getItem('edunova_salary_slips');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        // Migration for specific campus names requested by user
        const campusMigration = localStorage.getItem('campus_migration_v1');
        if (!campusMigration) {
            setCampuses(INITIAL_CAMPUSES);
            localStorage.setItem('campus_migration_v1', 'true');
        }
    }, []);

    const updatePeriodSettings = (settings: Record<string, PeriodTime[]>) => {
        setPeriodSettings(settings);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Priority 1: Local Storage Sync (Always allowed, as it started from local data)
            try {
                localStorage.setItem('edunova_students', JSON.stringify(students));
                localStorage.setItem('edunova_teachers', JSON.stringify(teachers));
                localStorage.setItem('edunova_settings', JSON.stringify(settings));
                localStorage.setItem('edunova_attendance', JSON.stringify(attendance));
                localStorage.setItem('edunova_fees', JSON.stringify(feeStructure));
                localStorage.setItem('edunova_classes', JSON.stringify(classes));
                localStorage.setItem('edunova_period_settings_v2', JSON.stringify(periodSettings));
                localStorage.setItem('edunova_class_subjects', JSON.stringify(classSubjects));
                localStorage.setItem('edunova_subject_total_marks', JSON.stringify(subjectTotalMarks));
                localStorage.setItem('edunova_class_incharge', JSON.stringify(classInCharge));
                localStorage.setItem('edunova_subject_teachers', JSON.stringify(subjectTeachers));
                localStorage.setItem('edunova_timetables', JSON.stringify(timetables));
                localStorage.setItem('edunova_exams_v2', JSON.stringify(exams));
                localStorage.setItem('edunova_exam_results_v2', JSON.stringify(examResults));
                localStorage.setItem('edunova_notifications', JSON.stringify(notifications));
                localStorage.setItem('edunova_audit_logs', JSON.stringify(auditLogs));
                localStorage.setItem('edunova_campuses', JSON.stringify(campuses));
                localStorage.setItem('edunova_expenses', JSON.stringify(expenses));
                localStorage.setItem('edunova_salary_slips', JSON.stringify(salarySlips));
            } catch (err) {
                console.error('CRITICAL: LocalStorage Full or Corrupted.', err);
            }

            // Priority 2: Cloud Sync (Only if fetch finished)
            if (isInitialLoading) return;

            const syncToCloud = async () => {
                try {
                    // Bulk Sync Students and Teachers (ensure they exist in their own tables)
                    if (students.length > 0) {
                        await supabase.from('students').upsert(students, { onConflict: 'id' });
                    }
                    if (teachers.length > 0) {
                        await supabase.from('teachers').upsert(teachers, { onConflict: 'id' });
                    }

                    // Bulk Sync App Data
                    const appDataPayload = [
                        { id: 'settings', data: settings },
                        { id: 'attendance', data: attendance },
                        { id: 'feeStructure', data: feeStructure },
                        { id: 'classes', data: classes },
                        { id: 'periodSettings', data: periodSettings },
                        { id: 'classSubjects', data: classSubjects },
                        { id: 'subjectTotalMarks', data: subjectTotalMarks },
                        { id: 'classInCharge', data: classInCharge },
                        { id: 'subjectTeachers', data: subjectTeachers },
                        { id: 'timetables', data: timetables },
                        { id: 'exams', data: exams },
                        { id: 'examResults', data: examResults },
                        { id: 'notifications', data: notifications },
                        { id: 'auditLogs', data: auditLogs },
                        { id: 'expenses', data: expenses },
                        { id: 'salarySlips', data: salarySlips },
                        { id: 'campuses', data: campuses }
                    ];
                    await supabase.from('app_data').upsert(appDataPayload, { onConflict: 'id' });
                } catch (e) {
                    console.error('AppData Cloud Sync Error:', e);
                }
            };
            syncToCloud();
        }, 3000);

        return () => clearTimeout(timeoutId);
    }, [
        isInitialLoading, students, teachers, settings, attendance, feeStructure,
        classes, periodSettings, classSubjects, subjectTotalMarks, classInCharge,
        subjectTeachers, timetables, exams, examResults, notifications, auditLogs, campuses, expenses, salarySlips
    ]);

    // Apply Theme Engine
    useEffect(() => {
        if (settings.themeColors) {
            const root = document.documentElement;
            root.style.setProperty('--brand-primary', settings.themeColors.primary);
            root.style.setProperty('--brand-secondary', settings.themeColors.secondary);
            root.style.setProperty('--brand-accent', settings.themeColors.accent);
            root.style.setProperty('--brand-text', settings.themeColors.primary);
            root.style.setProperty('--brand-radius', settings.themeColors.borderRadius || '2.5rem');
            root.style.setProperty('--brand-glass', settings.themeColors.glassIntensity || '0.98');

            // Generate subtle variations for better aesthetics
            root.style.setProperty('--brand-primary-light', `${settings.themeColors.primary}20`);
            root.style.setProperty('--brand-secondary-light', `${settings.themeColors.secondary}20`);
        }
    }, [settings.themeColors]);

    const promoteStudents = (fromClass: string, toClass: string) => {
        setStudents(prev => prev.map(s => s.class === fromClass ? { ...s, class: toClass } : s));
    };

    const sanitizeNumber = (val: any) => {
        if (typeof val === 'number') return val;
        if (val === null || val === undefined || val === '') return 0;
        const cleaned = val.toString().replace(/[^0-9.-]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : Math.round(num);
    };

    const addStudent = async (s: Partial<Student>) => {
        const studentId = s.id || `ADM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const newStudent: Student = {
            ...s as Student,
            id: studentId,
            status: s.status || 'Active',
            performance: s.performance || 'N/A',
            feesPaid: sanitizeNumber(s.feesPaid || s.feesPaid),
            feesTotal: sanitizeNumber(s.feesTotal || s.feesTotal),
            avatar: s.avatar || (s.name || 'S').charAt(0),
            admissionFees: sanitizeNumber(s.admissionFees),
            monthlyFees: sanitizeNumber(s.monthlyFees),
            securityFees: sanitizeNumber(s.securityFees),
            miscellaneousCharges: sanitizeNumber(s.miscellaneousCharges),
            academicRecords: s.academicRecords || [],
            documents: s.documents || {},
            paymentHistory: s.paymentHistory || [],
            discounts: s.discounts || []
        };

        setStudents(prev => {
            const index = prev.findIndex(item => item.id === studentId);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = newStudent;
                return updated;
            }
            return [...prev, newStudent];
        });

        try {
            const { error } = await supabase.from('students').upsert(newStudent, { onConflict: 'id' });
            if (error) {
                console.error('Supabase Add/Update Student Error:', error);
            }
        } catch (err) {
            console.error('Critical Student Sync Error:', err);
        }

        // Trigger Admission Welcome Notification (if not already existing)
        const welcomeMsg = MESSAGE_TEMPLATES.ADMISSION_WELCOME(
            newStudent.name,
            newStudent.id,
            settings.schoolName
        );
        sendNotification(newStudent.id, 'General', welcomeMsg);
    };

    const updateStudent = async (oldId: string, updates: Partial<Student>) => {
        const newId = updates.id;

        setStudents(prev => prev.map(s => s.id === oldId ? { ...s, ...updates } : s));

        try {
            await supabase.from('students').update(updates).eq('id', oldId);
        } catch (err) {
            console.error('Failed to update student in Supabase:', err);
        }

        // If ID has changed, propagate to other records
        if (newId && newId !== oldId) {
            setAttendance((prev: Attendance[]) => prev.map((a: Attendance) => ({
                ...a,
                records: a.records.map((r: AttendanceRecord) => r.studentId === oldId ? { ...r, studentId: newId } : r)
            })));

            setExamResults((prev: StudentExamResult[]) => prev.map((r: StudentExamResult) => r.studentId === oldId ? { ...r, studentId: newId } : r));

            setNotifications((prev: Notification[]) => prev.map((n: Notification) => n.studentId === oldId ? { ...n, studentId: newId } : n));
        }
    };

    const deleteStudent = async (id: string) => {
        setStudents(prev => prev.filter(s => s.id !== id));
        try {
            await supabase.from('students').delete().eq('id', id);
        } catch (err) {
            console.error('Failed to delete student from Supabase:', err);
        }
    };

    const addTeacher = async (t: Partial<Teacher>) => {
        const teacherId = t.id || `PST-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const newTeacher: Teacher = {
            id: teacherId,
            name: t.name || '',
            subject: t.subject || '',
            phone: t.phone || '',
            avatar: t.avatar || (t.name || 'P').charAt(0),
            status: 'Active',
            classes: t.classes || [],
            whatsappNumber: t.whatsappNumber || '',
            email: t.email || '',
            fatherName: t.fatherName || '',
            password: t.password || '',
            username: t.username || '',
            permissions: t.permissions || [],
            baseSalary: sanitizeNumber(t.baseSalary),
            ...t
        } as Teacher;

        setTeachers(prev => {
            const index = prev.findIndex(item => item.id === teacherId);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = newTeacher;
                return updated;
            }
            return [...prev, newTeacher];
        });

        try {
            await supabase.from('teachers').upsert(newTeacher, { onConflict: 'id' });
        } catch (err) {
            console.error('Failed to sync teacher to Supabase:', err);
        }
    };

    const updateTeacher = async (id: string, updates: Partial<Teacher>) => {
        setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        try {
            await supabase.from('teachers').update(updates).eq('id', id);
        } catch (err) {
            console.error('Failed to update teacher in Supabase:', err);
        }
    };

    const deleteTeacher = async (id: string) => {
        setTeachers(prev => prev.filter(t => t.id !== id));
        try {
            await supabase.from('teachers').delete().eq('id', id);
        } catch (err) {
            console.error('Failed to delete teacher from Supabase:', err);
        }
    };

    const updateSettings = (updates: Partial<SchoolSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    const markAttendance = (newAttendance: Attendance) => {
        setAttendance(prev => {
            const oldRecord = prev.find(a =>
                a.date === newAttendance.date &&
                a.class === newAttendance.class &&
                a.campus === newAttendance.campus
            );

            // Fee Adjustment Protocol
            setStudents(currentStudents => {
                return currentStudents.map(student => {
                    const studentInBatch = newAttendance.records.find(r => r.studentId === student.id);
                    if (!studentInBatch) return student;

                    const oldStatus = oldRecord?.records.find(r => r.studentId === student.id)?.status;
                    const newStatus = studentInBatch.status;

                    let feeAdjustment = 0;
                    if (oldStatus !== 'Absent' && newStatus === 'Absent') feeAdjustment = 50;
                    else if (oldStatus === 'Absent' && newStatus !== 'Absent') feeAdjustment = -50;

                    if (feeAdjustment !== 0) {
                        return { ...student, feesTotal: (student.feesTotal || 0) + feeAdjustment };
                    }
                    return student;
                });
            });

            const filtered = prev.filter(a => !(a.date === newAttendance.date && a.class === newAttendance.class && a.campus === newAttendance.campus));

            // Automated Attendance Notifications
            newAttendance.records.forEach(record => {
                const student = students.find(s => s.id === record.studentId);
                if (student && (record.status === 'Absent' || record.status === 'Late')) {
                    const msg = record.status === 'Absent'
                        ? MESSAGE_TEMPLATES.ATTENDANCE_ABSENT(student.name, newAttendance.date, settings.schoolName)
                        : MESSAGE_TEMPLATES.ATTENDANCE_LATE(student.name, newAttendance.date, settings.schoolName);

                    sendNotification(student.id, 'Attendance', msg);
                }
            });

            return [...filtered, newAttendance];
        });
    };

    const sendNotification = async (
        studentId: string,
        type: 'Attendance' | 'Fee' | 'General',
        message: string,
        media?: string,
        filename?: string
    ) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const targetNo = student.whatsappNumber || student.contactFather || student.contactSelf || 'N/A';
        const newNotification: Notification = {
            id: `NTF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            studentId,
            studentName: student.name,
            type,
            message,
            status: 'Pending',
            date: new Date().toLocaleString(),
            targetNumber: targetNo
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 100));

        if (targetNo !== 'N/A') {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30s for media

            try {
                const cleanNumber = normalizeWhatsAppNumber(targetNo);

                fetch('/api/wa/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to: cleanNumber, message, media, filename }),
                    signal: controller.signal
                }).then(async (res) => {
                    clearTimeout(timeoutId);
                    if (res.ok) {
                        setNotifications(prev => prev.map(n => n.id === newNotification.id ? { ...n, status: 'Queued' } : n));
                        addAuditLog({
                            user: 'System',
                            action: 'WhatsApp Relay',
                            type: 'System',
                            details: `${media ? 'Document' : 'Neural alert'} dispatched to ${student.name} (${cleanNumber})`
                        });
                    } else {
                        const errorData = await res.json().catch(() => ({ error: 'Unknown server error' }));
                        setNotifications(prev => prev.map(n => n.id === newNotification.id ? { ...n, status: 'Failed' } : n));
                        addAuditLog({ user: 'System', action: 'Relay Failed', type: 'System', details: `Gateway error for ${student.name}: ${errorData.error || res.statusText}` });
                    }
                }).catch((err) => {
                    clearTimeout(timeoutId);
                    console.error('WhatsApp Fetch Error:', err);
                    setNotifications(prev => prev.map(n => n.id === newNotification.id ? { ...n, status: 'Failed' } : n));
                    addAuditLog({ user: 'System', action: 'Relay Timeout/Error', type: 'System', details: `Connection failure for ${student.name}: ${err.name === 'AbortError' ? 'Timeout' : 'Network error'}` });
                });
            } catch (err) {
                console.error('WhatsApp Relay Error:', err);
            }
        } else {
            addAuditLog({
                user: 'System',
                action: 'Notification Skipped',
                type: 'System',
                details: `No valid contact for ${student.name}`
            });
        }
        console.log(`%c [OUTGOING MESSAGE] To: ${targetNo} | Content: ${message}`, 'background: #25D366; color: white; padding: 2px 5px; border-radius: 4px;');
    };

    const triggerFeeReminders = (className?: string, studentId?: string) => {
        let targets = students.filter(s => (s.feesTotal - s.feesPaid) > 0);

        if (studentId) {
            targets = targets.filter(s => s.id === studentId);
        } else if (className) {
            targets = targets.filter(s => s.class === className);
        }

        targets.forEach(student => {
            const pending = student.feesTotal - student.feesPaid;
            const msg = MESSAGE_TEMPLATES.FEE_REMINDER(student.name, pending, settings.schoolName);
            // Send through built-in Baileys Relay
            sendNotification(student.id, 'Fee', msg);
        });
    };

    const updateFeeStructure = (updates: Record<string, number>) => {
        setFeeStructure(prev => ({ ...prev, ...updates }));
    };

    const addClass = (name: string, fee: number) => {
        if (classes.includes(name)) return;
        setClasses(prev => [...prev, name]);
        setFeeStructure(prev => ({ ...prev, [name]: fee }));
    };

    const updateClass = (oldName: string, newName: string, fee: number) => {
        setClasses(prev => prev.map(c => c === oldName ? newName : c));
        setFeeStructure(prev => {
            const next = { ...prev };
            if (oldName !== newName) {
                const oldFee = next[oldName];
                delete next[oldName];
                next[newName] = fee ?? oldFee;
            } else {
                next[newName] = fee;
            }
            return next;
        });
        // Update all students in this class
        if (oldName !== newName) {
            setStudents(prev => prev.map(s => s.class === oldName ? { ...s, class: newName } : s));

            // Update Exam Results
            setExamResults(prev => prev.map(er => er.className === oldName ? { ...er, className: newName } : er));

            // Update Attendance records
            setAttendance(prev => prev.map(att => att.class === oldName ? { ...att, class: newName } : att));

            // Update Class-linked settings
            setClassSubjects(prev => {
                if (!prev[oldName]) return prev;
                const next = { ...prev };
                next[newName] = next[oldName];
                delete next[oldName];
                return next;
            });

            setSubjectTotalMarks(prev => {
                if (!prev[oldName]) return prev;
                const next = { ...prev };
                next[newName] = next[oldName];
                delete next[oldName];
                return next;
            });

            setClassInCharge(prev => {
                if (!prev[oldName]) return prev;
                const next = { ...prev };
                next[newName] = next[oldName];
                delete next[oldName];
                return next;
            });
        }
    };

    const deleteClass = (name: string) => {
        setClasses(prev => prev.filter(c => c !== name));
        setFeeStructure(prev => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
        setClassSubjects(prev => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
        setClassInCharge(prev => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const updateClassSubjects = (className: string, subjects: string[]) => {
        setClassSubjects(prev => ({ ...prev, [className]: subjects }));
    };

    const updateClassSubjectMarks = (className: string, marks: Record<string, number>) => {
        setSubjectTotalMarks(prev => ({ ...prev, [className]: marks }));
    };

    const updateClassInCharge = (className: string, teacherId: string) => {
        setClassInCharge(prev => ({ ...prev, [className]: teacherId }));
    };

    const assignSubjectTeacher = (className: string, subject: string, teacherId: string) => {
        setSubjectTeachers(prev => ({
            ...prev,
            [className]: {
                ...(prev[className] || {}),
                [subject]: teacherId
            }
        }));
    };

    const updateTimetable = (className: string, timetable: WeeklyTimetable) => {
        setTimetables(prev => ({ ...prev, [className]: timetable }));
    };

    const updateAllTimetables = (newTimetables: Record<string, WeeklyTimetable>) => {
        setTimetables(prev => ({ ...prev, ...newTimetables }));
    };

    const bulkUpdateStudents = (studentIds: string[], updates: Partial<Student>) => {
        setStudents(prev => prev.map(s => studentIds.includes(s.id) ? { ...s, ...updates } : s));

        // Update examResults className for the active students if their class changed
        if (updates.class) {
            setExamResults(prev => prev.map(er => {
                if (studentIds.includes(er.studentId)) {
                    return { ...er, className: updates.class as string };
                }
                return er;
            }));

            // Note: History of attendance for these specific students stays in the old class 
            // records unless we split the attendance objects, which is technically complex.
            // However, they will now appear in the NEW class's attendance lists from today onwards.
        }
    };

    const addExam = (e: Partial<Exam>) => {
        const newExam: Exam = {
            id: `EXM-${Date.now()}`,
            name: e.name || 'Untitled Exam',
            classes: e.classes || [],
            date: e.date || new Date().toISOString().split('T')[0],
            status: 'In Progress',
            createdAt: new Date().toISOString(),
            session: e.session
        };
        setExams(prev => [...prev, newExam]);
    };

    const updateExam = (id: string, updates: Partial<Exam>) => {
        setExams(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    };

    const deleteExam = (id: string) => {
        setExams(prev => prev.filter(e => e.id !== id));
        setExamResults(prev => prev.filter(er => er.examId !== id));
    };

    const inputMarks = (examId: string, className: string, studentId: string, subject: string, obtained: number | string, total: number = 100) => {
        setExamResults(prev => {
            const existingIndex = prev.findIndex(r => r.examId === examId && r.studentId === studentId);
            const isMissing = obtained === '' || (typeof obtained === 'string' && obtained.trim() === '') || obtained === null || obtained === undefined;
            const numericObtained = Number(obtained);

            if (existingIndex >= 0) {
                const updatedPrev = [...prev];
                const r = { ...updatedPrev[existingIndex] };
                const newMarks = { ...r.marks };

                if (isMissing) {
                    delete newMarks[subject];
                } else {
                    newMarks[subject] = { obtained: numericObtained, total };
                }

                r.marks = newMarks;

                // Live metrics calculation
                r.totalObtained = Object.values(newMarks).reduce((sum: number, m: any) => sum + (Number(m.obtained) || 0), 0);
                r.totalPossible = Object.values(newMarks).reduce((sum: number, m: any) => sum + (Number(m.total) || 0), 0);
                r.percentage = r.totalPossible > 0 ? (r.totalObtained / r.totalPossible) * 100 : 0;

                updatedPrev[existingIndex] = r;
                return updatedPrev;
            } else {
                if (isMissing) return prev; // don't create if missing
                const newMarks = { [subject]: { obtained: numericObtained, total } };
                return [...prev, {
                    examId,
                    studentId,
                    className,
                    marks: newMarks,
                    totalObtained: numericObtained,
                    totalPossible: total,
                    percentage: total > 0 ? (numericObtained / total) * 100 : 0,
                    grade: 'N/A',
                    position: null
                }];
            }
        });
    };

    const finalizeResults = (examId: string, className: string) => {
        const generateRemarks = (_percentage: number, grade: string, _position: number | null) => {
            if (grade === 'A++') return "Extraordinary";
            if (grade === 'A+') return "Exceptional";
            if (grade === 'A') return "Outstanding";
            if (grade === 'B++') return "Excellent";
            if (grade === 'B+') return "Very Good";
            if (grade === 'B') return "Good";
            if (grade === 'C+') return "Fairly Good";
            if (grade === 'C') return "Above Average";
            if (grade === 'D') return "Emerging";

            return "Needs Improvement";
        };

        setExamResults(prev => {
            // Map students for quick campus lookup
            const studentMap = new Map(students.map(s => [s.id, s.campus]));

            // 1. Get ALL results for this exam to calculate global rankings
            const allExamResults = prev.filter(r => r.examId === examId).map(res => {
                const totalObtained = Object.values(res.marks).reduce((sum, m) => sum + (Number(m.obtained) || 0), 0);
                const totalPossible = Object.values(res.marks).reduce((sum, m) => sum + (Number(m.total) || 0), 0);
                const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;

                let grade = 'F';
                if (percentage >= 96) grade = 'A++';
                else if (percentage >= 91) grade = 'A+';
                else if (percentage >= 86) grade = 'A';
                else if (percentage >= 81) grade = 'B++';
                else if (percentage >= 76) grade = 'B+';
                else if (percentage >= 71) grade = 'B';
                else if (percentage >= 61) grade = 'C+';
                else if (percentage >= 51) grade = 'C';
                else if (percentage >= 40) grade = 'D';

                return { ...res, totalObtained, totalPossible, percentage, grade };
            });

            // 2. Global (School) Sorted
            const schoolSorted = [...allExamResults].sort((a, b) => b.percentage - a.percentage);

            // 3. Process the results for the requested class
            const classResults = allExamResults.filter(r => r.className === className);
            classResults.sort((a, b) => b.percentage - a.percentage);

            const updatedClassResults = classResults.map((res, index) => {
                const classPos = index + 1;

                // Find school position
                const schoolPos = schoolSorted.findIndex(s => s.studentId === res.studentId) + 1;

                // Find campus position
                const studentCampus = studentMap.get(res.studentId);
                let campusPos: number | null = null;
                if (studentCampus) {
                    const campusSorted = allExamResults
                        .filter(r => studentMap.get(r.studentId) === studentCampus)
                        .sort((a, b) => b.percentage - a.percentage);
                    campusPos = campusSorted.findIndex(s => s.studentId === res.studentId) + 1;
                }

                return {
                    ...res,
                    position: classPos,
                    schoolPosition: schoolPos,
                    campusPosition: campusPos,
                    remarks: generateRemarks(res.percentage, res.grade, classPos)
                };
            });

            const otherResults = prev.filter(r => !(r.examId === examId && r.className === className));
            return [...otherResults, ...updatedClassResults];
        });

        setExams(prev => prev.map(e => e.id === examId ? { ...e, status: 'Finalized' } : e));

    };

    const [currentUser, setCurrentUser] = useState<{ id: string, name: string, role: string, permissions?: string[] } | null>(() => {
        const saved = localStorage.getItem('edunova_current_user');
        return saved ? JSON.parse(saved) : null;
    });

    const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
        const newLog: AuditLog = {
            ...log,
            id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toLocaleString()
        };
        setAuditLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
    };

    const login = (id: string, password?: string, roleToUse?: string) => {
        const normalizedId = id.trim().toLowerCase();

        // Ensure role works with backwards compatible signature if password isn't passed
        const actualRole = roleToUse || (['admin', 'teacher', 'student'].includes(password || '') ? password : undefined);
        const actualPassword = roleToUse ? password : undefined;

        if (actualRole === 'admin') {
            const expectedUser = settings.adminUsername ? settings.adminUsername.toLowerCase() : 'admin';

            if (normalizedId === expectedUser) {
                // Check password if it's set in settings
                if (settings.adminPassword && settings.adminPassword !== actualPassword) {
                    return false;
                }
                const user = { id: 'admin', name: 'Super Admin', role: 'admin' };
                setCurrentUser(user);
                localStorage.setItem('edunova_current_user', JSON.stringify(user));
                addAuditLog({
                    user: 'Super Admin',
                    action: 'System Login',
                    type: 'Security',
                    details: 'Admin authenticated successfully.'
                });
                return true;
            }
            return false;
        }

        if (actualRole === 'teacher') {
            const teacher = teachers.find(t =>
                t.id?.toLowerCase() === normalizedId ||
                t.username?.toLowerCase() === normalizedId
            );
            if (teacher) {
                // Find the class where this teacher is in-charge
                const assignedClass = Object.keys(classInCharge).find(cls => classInCharge[cls] === teacher.id);

                const user = {
                    id: teacher.id,
                    name: teacher.name,
                    role: 'teacher',
                    permissions: teacher.permissions || [],
                    inchargeClass: assignedClass // Use the mapped class
                };
                setCurrentUser(user);
                localStorage.setItem('edunova_current_user', JSON.stringify(user));
                addAuditLog({
                    user: teacher.name,
                    action: 'Teacher Login',
                    type: 'Security',
                    details: `${teacher.name} logged into the portal.`
                });
                return true;
            }
        }

        if (actualRole === 'student') {
            const student = students.find(s => s.id?.toLowerCase() === normalizedId);
            if (student) {
                const user = { id: student.id, name: student.name, role: 'student' };
                setCurrentUser(user);
                localStorage.setItem('edunova_current_user', JSON.stringify(user));
                addAuditLog({
                    user: student.name,
                    action: 'Student Login',
                    type: 'Security',
                    details: `${student.name} accessed the student portal.`
                });
                return true;
            }
        }

        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('edunova_current_user');
    };

    const addExpense = (e: Omit<Expense, 'id'>) => {
        const newExpense = { ...e, id: `EXP-${Date.now()}` };
        setExpenses(prev => [...prev, newExpense as Expense]);
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const generateSalarySlips = (month: string, year: number) => {
        const slips = teachers
            .filter(t => t.status === 'Active')
            .map(t => ({
                id: `SAL-${t.id}-${month}-${year}`,
                teacherId: t.id,
                month,
                year,
                baseSalary: t.baseSalary || 0,
                allowances: [],
                deductions: [],
                netSalary: t.baseSalary || 0,
                status: 'Pending' as const
            }));
        setSalarySlips(prev => {
            const existingIds = slips.map(s => s.id);
            const filtered = prev.filter(p => !existingIds.includes(p.id));
            return [...filtered, ...slips as SalarySlip[]];
        });
    };

    const updateSalarySlip = (id: string, updates: Partial<SalarySlip>) => {
        setSalarySlips(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const importBackup = async (data: any) => {
        try {
            if (!data || typeof data !== 'object') throw new Error('Invalid backup format');
            let hasErrors = false;
            let errorMessages: string[] = [];

            // Sanitize and update each state if present in the backup
            if (data.students) {
                const cleaned = sanitizeObject(data.students);
                const allowedStudentKeys = ["id", "name", "class", "status", "performance", "avatar", "feesPaid", "feesTotal", "monthlyTuition", "fatherName", "fatherOccupation", "monthlyIncome", "address", "dob", "contactSelf", "contactFather", "gender", "religion", "nationality", "cnic", "discipline", "email", "campus", "isOrphan", "whatsappNumber", "admissionDate", "admissionFees", "monthlyFees", "securityFees", "miscellaneousCharges", "academicRecords", "documents", "manualId", "paymentHistory", "discounts"];
                const dbReadyStudents = Array.from(new Map(cleaned.map((s: any) => {
                    const obj: any = {};
                    allowedStudentKeys.forEach(k => {
                        if (s[k] !== undefined) obj[k] = s[k];
                    });
                    ['feesPaid', 'feesTotal', 'monthlyTuition', 'admissionFees', 'monthlyFees', 'securityFees', 'miscellaneousCharges'].forEach(k => {
                        if (obj[k] === "" || obj[k] === null || obj[k] === undefined) obj[k] = 0;
                        else obj[k] = Number(obj[k]);
                    });
                    ['academicRecords', 'paymentHistory', 'discounts'].forEach(k => {
                        if (!Array.isArray(obj[k])) obj[k] = [];
                    });
                    if (typeof obj.documents !== 'object' || Array.isArray(obj.documents)) obj.documents = {};
                    return [obj.id, obj];
                })).values());

                try {
                    const { data: currentStudents, error: fetchErr } = await supabase.from('students').select('id');
                    if (fetchErr) throw fetchErr;
                    if (currentStudents && currentStudents.length > 0) {
                        const ids = currentStudents.map(s => s.id);

                        // Delete in batches of 100 to avoid request URL too long
                        for (let i = 0; i < ids.length; i += 100) {
                            const { error: delErr } = await supabase.from('students').delete().in('id', ids.slice(i, i + 100));
                            if (delErr) throw delErr;
                        }
                    }
                    if (dbReadyStudents.length > 0) {
                        const { error: insErr } = await supabase.from('students').insert(dbReadyStudents);
                        if (insErr) throw insErr;
                    }
                    setStudents(cleaned);
                } catch (e: any) {
                    hasErrors = true;
                    errorMessages.push('Students sync failed: ' + e.message);
                    console.error('Failed to sync students to Supabase:', e);
                }
            }
            if (data.teachers) {
                const cleaned = sanitizeObject(data.teachers);
                const allowedTeacherKeys = ["id", "name", "subject", "classes", "status", "avatar", "cnic", "address", "dob", "gender", "religion", "nationality", "phone", "email", "qualification", "experience", "joiningDate", "campus", "whatsappNumber", "employmentType", "fatherName", "husbandName", "maritalStatus", "baseSalary", "username", "password", "permissions", "role", "inchargeClass", "documents"];
                const dbReadyTeachers = Array.from(new Map(cleaned.map((t: any) => {
                    const obj: any = {};
                    allowedTeacherKeys.forEach(k => {
                        if (t[k] !== undefined) obj[k] = t[k];
                    });
                    if (obj.baseSalary === "" || obj.baseSalary === null || obj.baseSalary === undefined) obj.baseSalary = 0;
                    else obj.baseSalary = Number(obj.baseSalary);
                    ['classes', 'permissions'].forEach(k => {
                        if (!Array.isArray(obj[k])) obj[k] = [];
                    });
                    if (typeof obj.documents !== 'object' || Array.isArray(obj.documents)) obj.documents = {};
                    return [obj.id, obj];
                })).values());

                try {
                    const { data: currentTeachers, error: fetchErr } = await supabase.from('teachers').select('id');
                    if (fetchErr) throw fetchErr;

                    if (currentTeachers && currentTeachers.length > 0) {
                        const ids = currentTeachers.map(t => t.id);
                        for (let i = 0; i < ids.length; i += 100) {
                            const { error: delErr } = await supabase.from('teachers').delete().in('id', ids.slice(i, i + 100));
                            if (delErr) throw delErr;
                        }
                    }
                    if (dbReadyTeachers.length > 0) {
                        const { error: insErr } = await supabase.from('teachers').insert(dbReadyTeachers);
                        if (insErr) throw insErr;
                    }
                    setTeachers(cleaned);
                } catch (e: any) {
                    hasErrors = true;
                    errorMessages.push('Teachers sync failed: ' + e.message);
                    console.error('Failed to sync teachers to Supabase:', e);
                }
            }

            if (hasErrors) {
                alert("Backup partially restored. Errors: " + errorMessages.join(", "));
            }
            if (data.settings) setSettings(data.settings);
            if (data.attendance) setAttendance(data.attendance);
            if (data.feeStructure) setFeeStructure(data.feeStructure);
            if (data.classes) setClasses(data.classes);
            if (data.periodSettings) setPeriodSettings(data.periodSettings);
            if (data.classSubjects) setClassSubjects(data.classSubjects);
            if (data.subjectTotalMarks) setSubjectTotalMarks(data.subjectTotalMarks);
            if (data.classInCharge) setClassInCharge(data.classInCharge);
            if (data.subjectTeachers) setSubjectTeachers(data.subjectTeachers);
            if (data.timetables) setTimetables(data.timetables);
            if (data.exams) setExams(data.exams);
            if (data.examResults) setExamResults(data.examResults);
            if (data.notifications) setNotifications(data.notifications);
            if (data.auditLogs) setAuditLogs(data.auditLogs);
            if (data.expenses) setExpenses(data.expenses);
            if (data.salarySlips) setSalarySlips(data.salarySlips);

            // Force localStorage sync immediately for peace of mind
            Object.entries(data).forEach(([key, val]) => {
                if (key === 'feeStructure') localStorage.setItem('edunova_fees', JSON.stringify(val));
                else if (key === 'periodSettings') localStorage.setItem('edunova_period_settings', JSON.stringify(val));
                else if (key === 'auditLogs') localStorage.setItem('edunova_audit_logs', JSON.stringify(val));
                else if (key === 'salarySlips') localStorage.setItem('edunova_salary_slips', JSON.stringify(val));
                else localStorage.setItem(`edunova_${key}`, JSON.stringify(val));
            });

            return true;
        } catch (error) {
            console.error('Backup Import Failed:', error);
            return false;
        }
    };

    const addCampus = (c: Omit<Campus, 'id'>) => {
        const newCampus: Campus = {
            ...c,
            id: `CAMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`
        };
        setCampuses(prev => [...prev, newCampus]);
        addAuditLog({
            user: 'Admin',
            action: 'New Campus Added',
            details: `Campus: ${c.name}`,
            type: 'System'
        });
    };

    const updateCampus = (id: string, updates: Partial<Campus>) => {
        setCampuses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        addAuditLog({
            user: 'Admin',
            action: 'Campus Updated',
            details: `ID: ${id}`,
            type: 'System'
        });
    };

    const deleteCampus = (id: string) => {
        setCampuses(prev => prev.filter(c => c.id !== id));
        addAuditLog({
            user: 'Admin',
            action: 'Campus Deleted',
            details: `ID: ${id}`,
            type: 'Security'
        });
    };

    return (
        <StoreContext.Provider value={{
            students,
            teachers,
            settings,
            attendance,
            feeStructure,
            classes,
            periodSettings,
            updatePeriodSettings,
            addClass,
            updateClass,
            deleteClass,
            addStudent,
            updateStudent,
            deleteStudent,
            addTeacher,
            updateTeacher,
            deleteTeacher,
            updateSettings,
            markAttendance,
            updateFeeStructure,
            classSubjects,
            subjectTotalMarks,
            classInCharge,
            subjectTeachers,
            timetables,
            updateClassSubjects,
            updateClassSubjectMarks,
            updateClassInCharge,
            assignSubjectTeacher,
            updateTimetable,
            updateAllTimetables,
            promoteStudents,
            bulkUpdateStudents,
            exams,
            examResults,
            addExam,
            updateExam,
            deleteExam,
            inputMarks,
            finalizeResults,
            currentUser,
            login,
            logout,
            notifications,
            sendNotification,
            triggerFeeReminders,
            auditLogs,
            addAuditLog,
            expenses,
            salarySlips,
            addExpense,
            deleteExpense,
            generateSalarySlips,
            updateSalarySlip,
            importBackup,
            campuses,
            addCampus,
            updateCampus,
            deleteCampus
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within a StoreProvider');
    return context;
};
