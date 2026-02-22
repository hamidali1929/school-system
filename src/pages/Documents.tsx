// @ts-nocheck
import { useState, useMemo, useEffect } from 'react';
import {
    FileText,
    Printer,
    ChevronRight,
    Search as SearchIcon,
    Stamp,
    Award,
    Mail,
    FileSignature,
    ClipboardList,
    Plus,
    Type,
    ArrowRight,
    Search,
    Eye,
    Settings,
    ChevronDown,
    X,
    Maximize2,
    Layout,
    Image as ImageIcon,
    Upload,
    Award as Trophy,
    RotateCcw
} from 'lucide-react';
import { useStore, type Student, type Teacher } from '../context/StoreContext';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import mammoth from 'mammoth';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill-new';
import FullScreenStudentForm from '../components/FullScreenStudentForm';
import 'react-quill-new/dist/quill.snow.css';

const QUILL_MODULES = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['clean']
    ],
};

// --- Templates Configuration ---
const DOCUMENT_GROUPS = [
    {
        id: 'letters', label: 'Official Letters', icon: Mail,
        templates: [
            { id: 'adm_confirm', label: 'Admission Confirmation', type: 'student' },
            { id: 'suspension_letter', label: 'Suspension Letter', type: 'student' },
            { id: 'recommendation', label: 'Recommendation Letter', type: 'student' },
            { id: 'warn_student', label: 'Warning Letter', type: 'student' },
            { id: 'show_cause', label: 'Show Cause Notice', type: 'student' },
            { id: 'fee_due', label: 'Fee Reminder', type: 'student' },
            { id: 'exp_letter', label: 'Experience Letter (Staff)', type: 'teacher' },
        ]
    },
    {
        id: 'cert', label: 'Certificates', icon: Award,
        templates: [
            { id: 'english_proficiency', label: 'English Proficiency Cert', type: 'student' },
            { id: 'char_cert', label: 'Character Cert', type: 'student' },
            { id: 'slc', label: 'School Leaving', type: 'student' },
            { id: 'appreciation', label: 'Appreciation Certificate', type: 'student' },
            { id: 'achievement', label: 'Achievement Award', type: 'system' },
        ]
    },
    {
        id: 'forms', label: 'Official Forms', icon: ClipboardList,
        templates: [
            { id: 'bonafide_cert', label: 'Bonafide (To Whom)', type: 'student' },
            { id: 'adm_form', label: 'Admission Form (Blank)', type: 'system' },
            { id: 'noc', label: 'NOC / Transfer', type: 'student' },
        ]
    }
];

const PROF_HEADER = (logo: string, schoolName: string) => `
    <div style="display: flex; align-items: center; border-bottom: 3.5px solid #000; padding-bottom: 12px; margin-bottom: 25px; position: relative; font-family: 'Times New Roman', serif;">
        <div style="width: 90px; height: 90px; margin-right: 20px;">
            <img src="${logo || 'https://via.placeholder.com/100'}" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
        <div style="flex: 1; text-align: center;">
            <h1 style="margin: 0; color: #cc0000; font-size: 26pt; font-weight: 900; letter-spacing: 1px;">${schoolName.toUpperCase()}</h1>
            <h2 style="margin: 0; color: #cc0000; font-size: 15pt; font-weight: 700; margin-top: -2px;">SCIENCE SCHOOL & COLLEGE, ATTOCK</h2>
            <p style="margin: 2px 0; font-size: 10pt; font-style: italic;">(A Project of the Pioneer's School Since 1984)</p>
            <p style="margin: 0; font-size: 9.5pt; font-weight: bold;">(Affiliated with Federal Board of Intermediate and Secondary Education Islamabad)</p>
            <p style="margin: 0; font-size: 9pt;">(Inst Code: 2854)</p>
        </div>
    </div>
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; width: 400px; height: 400px; z-index: -1;">
        <img src="${logo}" style="width: 100%; height: 100%;" />
    </div>
`;

const PROF_FOOTER = `
    <div style="margin-top: 50px; border-top: 4px solid #cc0000; padding-top: 10px; font-family: 'Times New Roman', serif;">
        <div style="border-top: 2px solid #003366; margin-top: -8px; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="font-size: 8.5pt; font-weight: bold; color: #003366;">
                📍 Moh. Muhammad Nagar<br/>Mirza Road Attock
            </div>
            <div style="font-size: 8.5pt; font-weight: bold; color: #003366; text-align: center;">
                📧 psscc.official@gmail.com
            </div>
            <div style="font-size: 8.5pt; font-weight: bold; color: #003366; text-align: right;">
                📞 +9257 2364418 | +92334 5930217<br/>+92333 2333139
            </div>
        </div>
    </div>
`;

const TEMPLATE_CONTENT: Record<string, string> = {
    adm_confirm: `To,\n[PARENT_NAME]\nFather/Guardian of <b>[STUDENT_NAME]</b>\n[ADDRESS]\n\nSubject: <u><b>CONFIRMATION OF ADMISSION (Session [SESSION])</b></u>\n\nDear Parent,\n\nWe are pleased to inform you that your child <b>[STUDENT_NAME]</b> has been granted <b>ADMISSION</b> in <b>Class [CLASS]</b> at <b>[SCHOOL_NAME]</b> for the current Academic Session.\n\nYour child has been assigned Admission Number: <b><u>[ID]</u></b>. \n\nRegards,\n\n<b>Principal</b>`,

    suspension_letter: `<div style="text-align:center; margin-bottom: 20px;"><div style="font-size: 18pt; font-weight: 900; border-bottom: 2px solid #000; display: inline-block; padding-bottom: 2px;">SUSPENSION LETTER</div></div>\n\n<div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 20px;"><div>To: <u>[STUDENT_NAME] S/O [PARENT_NAME]</u></div><div>Date: [DATE]</div></div>\n<div style="font-weight: bold; margin-bottom: 20px;">[CLASS]</div>\n\n<b>Subject: <u>Violation of Discipline</u></b>\n\nIt has been observed that during school hours you misbehaved and violated school laws and rules. You performed an unacceptable act that cannot be tolerated. Discipline committee has imposed a fine of <b>Rs 1000/-</b> on you.\n\nSuch a rustic behavior is serious violation of discipline rules. Therefore, you are being <b>expelled from the school for three days</b> and it is mandatory to bring your father tomorrow.\n\n<div style="margin-top: 50px; text-align: right;"><b>Principal</b> ____________________</div>\n\n<div style="margin-top: 30px; font-size: 10pt;">Copy to Parents:<br/>Student Concerned:</div>`,

    english_proficiency: `[PROF_HEADER]\n<div style="text-align:center; margin-bottom: 40px;"><h2 style="font-size: 22pt; text-decoration: underline; font-weight: 900;">ENGLISH PROFICIENCY CERTIFICATE</h2></div>\n\n<p style="font-size: 14pt; line-height: 2; text-align: justify;">This is to certify that <b>Mr. [STUDENT_NAME]</b> S/O [PARENT_NAME], Adm No. <b>[ID]</b>, CNIC # [CNIC] is a bonafide student of <b>[CLASS]</b> at <b>Pioneers Superior Science School & College Attock, Pakistan</b>. The medium of instruction of this college is English. All the courses are offered, taught and assessed in English at tertiary level of education.</p>\n\n<div style="margin-top: 80px; display: flex; justify-content: space-between; font-weight: bold;">\n  <div>Date: __________</div>\n  <div>Principal: ____________________</div>\n</div>\n[PROF_FOOTER]`,

    bonafide_cert: `[PROF_HEADER]\n<div style="text-align:center; margin-bottom: 40px;"><h2 style="font-size: 22pt; text-decoration: underline; font-weight: 900;">TO WHOM IT MAY CONCERN</h2></div>\n\n<p style="font-size: 14pt; line-height: 2; text-align: justify;">It is certified that <b>[STUDENT_NAME]</b> (Reg # [ID]) S/O [PARENT_NAME] class <b>[CLASS]</b> is bonafide student of this College for the academic session <b>[SESSION]</b>. He/She will appear in annual examination of FBISE which will be held in [MONTH]. He/She is likely to pass the said examination securing excellent marks.</p>\n\n<div style="margin-top: 80px; display: flex; justify-content: space-between; font-weight: bold;">\n  <div>Date: __________</div>\n  <div>Principal: ____________________</div>\n</div>\n[PROF_FOOTER]`,

    recommendation: `[PROF_HEADER]\n<div style="text-align:center; margin-bottom: 30px;"><h2 style="font-size: 20pt; text-decoration: underline; font-weight: 900;">RECOMMENDATION LETTER</h2></div>\n\n<p style="font-size: 13pt; line-height: 1.8; text-align: justify;">I am pleased to write this letter in support of <b>Mr. [STUDENT_NAME]</b> S/O [PARENT_NAME] who was a student at <b>PIONEERS SUPERIOR SCIENCE SCHOOL & COLLEGE</b> during the session of [SESSION].\n\nDuring his stay, I found him one of the best students I dealt with. He is an energetic and hardworking student, and I hope he will prove as a good researcher at all study levels. Due to his creative mind and inherent hardworking nature, Mr. [STUDENT_NAME] is expected to achieve genuine development in any professional environment.\n\nI believe that he would be an excellent addition to any institution. I wish him success in life.</p>\n\n<div style="margin-top: 60px; display: flex; justify-content: space-between; font-weight: bold;">\n  <div>Date: __________</div>\n  <div>Principal: ____________________</div>\n</div>\n[PROF_FOOTER]`,

    warn_student: `To,\nThe Parent of <b>[STUDENT_NAME]</b>\nClass: [CLASS] | ID: <b>[ID]</b>\n\nSubject: <u><b>FIRST FORMAL WARNING - DISCIPLINARY</b></u>\n\nDear Parent,\n\nThis letter is to inform you that <b>[STUDENT_NAME]</b> conduct is <b>UNSATISFACTORY</b> regarding <b>[REASON]</b>.\n\nPlease note <b>further instances</b> may lead to <b><u>SUSPENSION</u></b>.\n\nRegards,\n<b>Principal</b>`,
    show_cause: `To,\nThe Parent of <b>[STUDENT_NAME]</b>\nClass: [CLASS] | ID: <b>[ID]</b>\n\nSubject: <u><b>SHOW CAUSE NOTICE - DISCIPLINARY ACTION</b></u>\n\nDear Parent,\n\nYou are hereby requested to show cause in writing as to why disciplinary action should not be taken against your child for <b>[REASON]</b>.\n\nPlease submit your explanation within 3 days of receiving this notice.\n\nRegards,\n<b>Principal</b>`,
    fee_due: `To,\nThe Parent of <b>[STUDENT_NAME]</b>\nClass: [CLASS] | ID: <b>[ID]</b>\n\nSubject: <u><b>OUTSTANDING FEE REMINDER</b></u>\n\nDear Parent,\n\nOur records indicate that the fee for the month of <b>[MONTH]</b> for your child <b>[STUDENT_NAME]</b> is still outstanding.\n\nYou are requested to clear the dues amounting to <b>PKR [AMOUNT]</b> by <b>[DUE_DATE]</b> to avoid any late payment surcharge.\n\nRegards,\n<b>Accountant/Principal</b>`,
    exp_letter: `To Whom It May Concern,\n\nSubject: <u><b>EXPERIENCE / SERVICE CERTIFICATE</b></u>\n\nThis is to certify that <b>[NAME]</b> S/O [PARENT_NAME] has served at this institution as <b>[DESIGNATION]</b> from <b>[JOIN_DATE]</b> to <b>[LEAVE_DATE]</b>.\n\nDuring his/her tenure, we found him/her to be hardworking, dedicated, and professional. We wish him/her the best in future endeavors.\n\nRegards,\n<b>Director/Principal</b>`,
    char_cert: `<div style="text-align:center; margin-bottom: 50px;"><h1 style="font-size: 28pt; text-decoration: underline; color: var(--brand-primary, #003366);">CHARACTER CERTIFICATE</h1></div>\n\nCertified that <b>[STUDENT_NAME]</b> Son/Daughter of <b>[PARENT_NAME]</b> resident of <b>[ADDRESS]</b> has been a regular student of this institution in <b>Class [CLASS]</b> under Admission No <b><u>[ID]</u></b>.\n\nHis/her conduct and character remained <b><u>EXCELLENT</u></b>.\n\n<div style="margin-top: 100px; text-align: right;"><b>Principal</b></div>`,
    slc: `<div style="text-align:center; margin-bottom: 30px;"><h1 style="font-size: 24pt; color: var(--brand-primary, #003366);"><u>SCHOOL LEAVING CERTIFICATE</u></h1></div>\n\nThis is to certify that <b>[STUDENT_NAME]</b> Son/Daughter of <b>[PARENT_NAME]</b> was a student from <b><u>[JOIN_DATE]</u></b> to <b><u>[LEAVE_DATE]</u></b>.\n\nHe/She has completed the course for <b>Class [CLASS]</b> examination.\n\n<div style="margin-top: 100px; display: flex; justify-content: space-between;"><div>Clerk</div><div><b>Principal</b></div></div>`,
    appreciation: `<div style="text-align:center; padding: 40px; border: 10px double var(--brand-primary); margin: 20px;">\n<h1 style="font-size: 32pt; font-family: 'Cinzel'; color: #b45309;">CERTIFICATE OF APPRECIATION</h1>\n<p style="font-size: 14pt; margin-top: 20px;">This certificate is proudly presented to</p>\n<h2 style="font-size: 28pt; color: var(--brand-primary); margin: 10px 0;">[STUDENT_NAME]</h2>\n<p style="font-size: 12pt; max-width: 80%; margin: 0 auto;">In recognition of your outstanding performance and dedication in [ACTIVITY]. Your commitment to excellence is truly inspiring.</p>\n<div style="margin-top: 50px; display: flex; justify-content: space-around;"><div>Date: [DATE]</div><div>Principal Signature</div></div>\n</div>`,
    achievement: `<div style="text-align:center; background: #fffcf0; padding: 50px; border: 15px solid #d4af37; outline: 5px solid #d4af37; outline-offset: -20px;">\n<h1 style="font-size: 35pt; color: #d4af37;">AWARD OF ACHIEVEMENT</h1>\n<p style="font-size: 15pt;">Awarded to</p>\n<h2 style="font-size: 30pt; color: #333;">[NAME]</h2>\n<p style="font-size: 13pt;">For achieving the [POSITION] position in the [EVENT] held on [DATE].</p>\n<div style="margin-top: 60px;">Principal: _________________</div>\n</div>`,
    noc: `To Whom It May Concern,\n\nSubject: <u><b>NO OBJECTION CERTIFICATE (NOC)</b></u>\n\nThis is to certify that <b>[STUDENT_NAME]</b> Son/Daughter of <b>[PARENT_NAME]</b> is a student of Class [CLASS] in our institution. \n\nThe school has <b>NO OBJECTION</b> if the student seeks admission in any other institution due to [REASON].\n\nAll dues have been cleared up to [MONTH].\n\nRegards,\n<b>Principal</b>`,
    adm_form: `ADMISSION_FORM_UI`
};

export const Documents = () => {
    const { students = [], teachers = [], settings = {} } = useStore() || {};
    const sanitizedSchoolName = useMemo(() => (settings?.schoolName || "PIONEER'S SUPERIOR").replace(/'{2,}/g, "'"), [settings?.schoolName]);
    const [activeGroup, setActiveGroup] = useState(DOCUMENT_GROUPS[0].id);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(DOCUMENT_GROUPS[0].templates[0]);
    const [targetEntity, setTargetEntity] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [previewScale, setPreviewScale] = useState(0.8);
    const [manualContent, setManualContent] = useState<string>('');
    const [isManual, setIsManual] = useState(false);
    const [docImage, setDocImage] = useState<string | null>(null);
    const [wordHtml, setWordHtml] = useState<string | null>(null);
    const [showFullScreenForm, setShowFullScreenForm] = useState(false);

    const handleTemplateSelect = (template: any) => {
        setSelectedTemplate(template);
        setFieldValues({});
        setIsManual(false);
        setManualContent('');
        if (template.id === 'adm_form') {
            setIsManual(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setDocImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleWordUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                try {
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    setWordHtml(result.value);
                    setManualContent(result.value);
                    setIsManual(true);
                    Swal.fire({
                        title: 'Word File Loaded',
                        text: 'Your document has been converted for preview. You can now edit it manually if needed.',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        timer: 3000,
                        showConfirmButton: false
                    });
                } catch (err) {
                    Swal.fire('Error', 'Could not read Word file. Please ensure it is a valid .docx file.', 'error');
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const filteredEntities = useMemo(() => {
        if (!searchQuery || searchQuery.length < 2) return [];
        const q = searchQuery.toLowerCase();
        const list = selectedTemplate?.type === 'teacher' ? teachers : students;
        return list.filter(e => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)).slice(0, 5);
    }, [searchQuery, selectedTemplate, students, teachers]);

    const activePlaceholders = useMemo(() => {
        const content = TEMPLATE_CONTENT[selectedTemplate?.id] || '';
        const matches = [...content.matchAll(/\[([A-Z0-9_]+)\]/g)];
        const systemTags = ['[SCHOOL_NAME]', '[STUDENT_NAME]', '[TEACHER_NAME]', '[ID]', '[CLASS]', '[PARENT_NAME]', '[ADDRESS]', '[DOB]', '[SESSION]'];
        return Array.from(new Set(matches.map(m => m[0]))).filter(tag => !systemTags.includes(tag));
    }, [selectedTemplate]);

    useEffect(() => {
        if (targetEntity) {
            setFieldValues(prev => ({
                ...prev,
                '[STUDENT_NAME]': targetEntity.name,
                '[ID]': targetEntity.id,
                '[CLASS]': targetEntity.class || 'N/A',
                '[PARENT_NAME]': targetEntity.fatherName || 'Guardian',
                '[ADDRESS]': targetEntity.address || 'N/A',
                '[SESSION]': settings?.academicSession || '2023-24'
            }));
        }
    }, [targetEntity, settings]);

    const finalContent = useMemo(() => {
        if (isManual) return manualContent;
        let text = TEMPLATE_CONTENT[selectedTemplate?.id] || '';

        // Inject Professional Header/Footer if placeholder exists
        text = text.replace('[PROF_HEADER]', PROF_HEADER(settings?.logo1, sanitizedSchoolName));
        text = text.replace('[PROF_FOOTER]', PROF_FOOTER);

        const data = {
            '[SCHOOL_NAME]': sanitizedSchoolName,
            '[SESSION]': settings?.academicSession || '2023-24',
            '[DATE]': new Date().toLocaleDateString(),
            '[CNIC]': targetEntity?.cnic || '____________________',
            '[DESIGNATION]': fieldValues['[DESIGNATION]'] || '____________________',
            '[JOIN_DATE]': fieldValues['[JOIN_DATE]'] || '__________',
            '[LEAVE_DATE]': fieldValues['[LEAVE_DATE]'] || '__________',
            '[MONTH]': fieldValues['[MONTH]'] || '__________',
            ...fieldValues
        };
        Object.entries(data).forEach(([tag, val]) => {
            text = text.replace(new RegExp(tag.replace('[', '\\[').replace(']', '\\]'), 'g'), val || `<span style="color:red;">...</span>`);
        });
        return text;
    }, [selectedTemplate, fieldValues, settings, isManual, manualContent]);

    // Sync manual content when entering manual mode for the first time
    const enterManualMode = () => {
        if (!isManual) {
            setManualContent(finalContent);
            setIsManual(true);
        }
    };

    const admissionFormHtmlContent = useMemo(() => {
        const s = settings || {};
        const logo1 = s.logo1 || '';
        const logo2 = s.logo2 || s.logo1 || '';
        const subTitle = s.subTitle || 'Institute of Higher Secondary Education';

        return `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Cinzel:wght@400;700;900&display=swap');
                .adm-container { font-family: 'Outfit', sans-serif; color: #1e293b; position: relative; padding: 0; width: 100%; }
                
                .adm-branding { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 2px; border-bottom: 1px solid var(--brand-primary, #003366); padding-bottom: 2px; }
                .adm-branding img { width: 50px; height: 50px; object-fit: contain; }
                .adm-branding-text { text-align: center; }
                .adm-school-name { font-family: 'Cinzel', serif; font-size: 18pt; color: var(--brand-primary, #003366); font-weight: 900; margin: 0; line-height: 1; text-transform: uppercase; }
                .adm-school-sub { font-size: 7.5pt; color: #64748b; font-weight: 700; margin-top: 1px; text-transform: uppercase; letter-spacing: 0.3px; }

                .adm-header-row { display: flex; align-items: stretch; gap: 8px; margin-bottom: 8px; height: 90px; margin-top: 10px; }
                
                .adm-reg-box { width: 160px; padding: 6px; border: 2px double var(--brand-primary, #003366); border-radius: 4px; background: #fff; display: flex; flex-direction: column; justify-content: center; }
                .adm-reg-item { display: flex; justify-content: space-between; margin-bottom: 3px; border-bottom: 0.5px solid #e2e8f0; padding-bottom: 1px; }
                .adm-reg-item label { font-weight: 900; color: var(--brand-primary, #003366); font-size: 6pt; text-transform: uppercase; }

                .adm-header-title-box { flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: center; position: relative; }
                .adm-header-title-box::after { content: ''; position: absolute; bottom: 0; left: 15%; right: 15%; height: 0.5px; background: linear-gradient(to right, transparent, var(--brand-primary, #003366), transparent); }
                .adm-title-main { font-family: 'Cinzel', serif; font-size: 16pt; color: var(--brand-primary, #003366); font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1px; line-height: 1.1; }

                .adm-photo-box { width: 90px; border: 1px solid var(--brand-primary, #003366); border-radius: 4px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 6.5pt; color: var(--brand-primary, #003366); background: #f8fafc; font-weight: 900; text-transform: uppercase; }

                .adm-section { margin-top: 8px; margin-bottom: 5px; }
                .adm-section-banner { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
                .adm-section-banner h2 { font-family: 'Cinzel', serif; font-size: 8.5pt; color: var(--brand-primary, #003366); font-weight: 900; margin: 0; white-space: nowrap; text-transform: uppercase; }
                .adm-section-line { height: 1px; background: var(--brand-primary, #003366); opacity: 0.1; flex: 1; }
                
                .adm-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
                .adm-field { position: relative; padding-top: 8px; }
                .adm-field.full { grid-column: span 6; }
                .adm-field.half { grid-column: span 3; }
                .adm-field.third { grid-column: span 2; }
                
                .adm-field label { position: absolute; top: -6px; left: 0; font-size: 6pt; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.2px; }
                .adm-field .adm-input-line { height: 24px; border-bottom: 1px solid var(--brand-primary, #003366); display: flex; align-items: flex-end; padding-bottom: 0px; }

                .adm-checklist { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; padding: 6px; background: #f8fafc; border: 0.5px dashed var(--brand-primary, #003366); border-radius: 4px; }
                .adm-check-item { display: flex; align-items: center; gap: 6px; font-size: 7pt; font-weight: 700; color: #1e293b; }
                .adm-sq { width: 10px; height: 10px; border: 1px solid var(--brand-primary, #003366); border-radius: 1px; background: white; }

                .adm-declaration { padding: 8px; font-size: 7.5pt; line-height: 1.3; text-align: justify; color: #334155; font-style: italic; border-left: 2px solid var(--brand-primary, #003366); background: #f1f5f9; margin: 5px 0; }
                .adm-sig-row { display: flex; justify-content: space-between; padding: 10px 30px 2px; }
                .adm-sig-box { text-align: center; border-top: 1px solid var(--brand-primary, #003366); width: 180px; padding-top: 3px; font-size: 7.5pt; font-weight: 900; color: var(--brand-primary, #003366); text-transform: uppercase; }
                
                .adm-footer { display: flex; justify-content: space-between; padding: 8px 30px; background: #1e293b; border-radius: 4px; font-size: 7.5pt; font-weight: 900; color: #fff; margin-top: 8px; }
            </style>
            <div class="adm-container">
                <div class="adm-branding">
                    <img src="${logo1}">
                    <div class="adm-branding-text">
                        <h1 class="adm-school-name">${sanitizedSchoolName}</h1>
                        <p class="adm-school-sub">${subTitle}</p>
                    </div>
                    <img src="${logo2}">
                </div>

                <div class="adm-header-row">
                    <div class="adm-reg-box">
                        <div class="adm-reg-item"><label>STUDENT ID:</label> <span>__________</span></div>
                        <div class="adm-reg-item"><label>FORM SERIAL:</label> <span>__________</span></div>
                        <div class="adm-reg-item"><label>ADM DATE:</label> <span>__________</span></div>
                    </div>

                    <div class="adm-header-title-box">
                        <h1 class="adm-title-main">Admission Form</h1>
                        <div style="font-size: 8pt; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Academic Session 2023 - 2024</div>
                    </div>

                    <div class="adm-photo-box">PHOTO</div>
                </div>
                
                <div class="adm-section">
                    <div class="adm-section-banner"><h2>01. Student Information</h2><div class="adm-section-line"></div></div>
                    <div class="adm-grid">
                        <div class="adm-field full"><label>Student's Full Name</label><div class="adm-input-line"></div></div>
                        <div class="adm-field half"><label>Date of Birth (DD/MM/YYYY)</label><div class="adm-input-line"></div></div>
                        <div class="adm-field half"><label>Gender</label><div class="adm-input-line"></div></div>
                        <div class="adm-field third"><label>Place of Birth</label><div class="adm-input-line"></div></div>
                        <div class="adm-field third"><label>Religion</label><div class="adm-input-line"></div></div>
                        <div class="adm-field third"><label>Blood Group</label><div class="adm-input-line"></div></div>
                        <div class="adm-field half"><label>B-Form / CNIC Number</label><div class="adm-input-line"></div></div>
                        <div class="adm-field half"><label>Nationality</label><div class="adm-input-line"></div></div>
                        <div class="adm-field full"><label>Current Address</label><div class="adm-input-line"></div></div>
                    </div>
                </div>

                <div class="adm-section">
                    <div class="adm-section-banner"><h2>02. Parent / Guardian Details</h2><div class="adm-section-line"></div></div>
                    <div class="adm-grid">
                        <div class="adm-field half"><label>Father's / Guardian Name</label><div class="adm-input-line"></div></div>
                        <div class="adm-field half"><label>Father's CNIC Number</label><div class="adm-input-line"></div></div>
                        <div class="adm-field third"><label>Occupation</label><div class="adm-input-line"></div></div>
                        <div class="adm-field third"><label>Primary Phone No.</label><div class="adm-input-line"></div></div>
                        <div class="adm-field third"><label>WhatsApp Number</label><div class="adm-input-line"></div></div>
                    </div>
                </div>

                <div class="adm-section">
                    <div class="adm-section-banner"><h2>03. Previous School & Documents</h2><div class="adm-section-line"></div></div>
                    <div class="adm-grid" style="margin-bottom: 10px;">
                        <div class="adm-field half"><label>Class for Admission</label><div class="adm-input-line"></div></div>
                        <div class="adm-field half"><label>Previous School Name</label><div class="adm-input-line"></div></div>
                    </div>
                    <div class="adm-checklist">
                        <div class="adm-check-item"><div class="adm-sq"></div> B-Form Copy</div>
                        <div class="adm-check-item"><div class="adm-sq"></div> Father's CNIC Copy</div>
                        <div class="adm-check-item"><div class="adm-sq"></div> 4x Recent Photos</div>
                        <div class="adm-check-item"><div class="adm-sq"></div> School Leaving Cert.</div>
                        <div class="adm-check-item"><div class="adm-sq"></div> Result Card</div>
                        <div class="adm-check-item"><div class="adm-sq"></div> Admission Fee Paid</div>
                    </div>
                </div>

                <div class="adm-section">
                    <div class="adm-section-banner"><h2>04. Declaration</h2><div class="adm-section-line"></div></div>
                    <div class="adm-declaration">
                        I declare that the information provided above is correct to the best of my knowledge. I agree to follow the rules and regulations of <b>${sanitizedSchoolName}</b> and will pay all school fees regularly.
                    </div>
                    <div class="adm-sig-row">
                        <div class="adm-sig-box">Parent's Signature</div>
                        <div class="adm-sig-box">Principal's Signature</div>
                    </div>
                    <div class="adm-footer">
                        <span>Admission Officer: ___________________________</span>
                        <span>Date: ___/___/202___</span>
                    </div>
                </div>
            </div>
        `;
    }, [sanitizedSchoolName, settings]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const s = settings || {};
        let contentHtml = '';

        if (selectedTemplate?.id === 'adm_form') {
            contentHtml = admissionFormHtmlContent;
        } else if (isManual && wordHtml) {
            contentHtml = `
                <div class="content word-content">
                    ${docImage ? `<div style="float: right; margin: 0 0 20px 20px; border: 2px solid #eee; padding: 4px; border-radius: 8px;"><img src="${docImage}" style="width: 140px; height: 160px; object-fit: cover; border-radius: 4px;" /></div>` : ''}
                    ${wordHtml}
                </div>`;
        } else {
            contentHtml = `
                <div class="content">
                    ${docImage ? `<div style="float: right; margin: 0 0 20px 20px; border: 2px solid #eee; padding: 4px; border-radius: 8px;"><img src="${docImage}" style="width: 140px; height: 160px; object-fit: cover; border-radius: 4px;" /></div>` : ''}
                    ${finalContent.replace(/\n/g, '<br/>')}
                </div>`;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Document</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Cinzel:wght@400;700;900&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
                        .page { 
                            width: 210mm; 
                            min-height: 297mm; 
                            padding: 2cm; 
                            background: white; 
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                            position: relative;
                            font-family: "Times New Roman", serif;
                            line-height: 1.6;
                            color: #1a1a1a;
                        }
                        .header { 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            gap: 30px; 
                            border-bottom: 5px double var(--brand-primary, #003366); 
                            padding-bottom: 25px; 
                            margin-bottom: 30px; 
                            text-align: center;
                            width: 100%;
                        }
                        .header img { 
                            width: 90px; 
                            height: 90px; 
                            object-fit: contain;
                            margin-top: -15px;
                        }
                        .header h1 { 
                            font-family: 'Cinzel', serif; 
                            color: var(--brand-primary, #003366); 
                            font-size: 28pt; 
                            text-transform: uppercase; 
                            margin: 0; 
                            white-space: nowrap;
                            line-height: 1.1;
                            letter-spacing: -1px;
                        }
                        .header p { 
                            font-family: 'Cinzel', serif;
                            font-size: 13pt; 
                            color: #000; 
                            font-weight: 900; 
                            text-transform: uppercase; 
                            margin-top: 5px;
                            letter-spacing: 0.8px;
                        }
                        .content { 
                            min-height: 15cm; 
                            font-size: 14pt; 
                            text-align: justify; 
                            white-space: pre-line; 
                        }
                        .footer {
                            margin-top: 40px;
                            padding-top: 15px;
                            border-top: 1px solid #eee;
                            text-align: center;
                            font-size: 9pt;
                            color: #888;
                        }
                        .watermark {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%) rotate(0deg);
                            opacity: 0.05;
                            width: 50%;
                            height: auto;
                            pointer-events: none;
                            z-index: 0;
                        }
                        @media print {
                            body { background: white; padding: 0; }
                            .page { width: 100%; box-shadow: none; margin: 0; padding: 1.5cm; }
                            @page { size: A4; margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="page">
                        ${selectedTemplate?.id !== 'adm_form' && s.logo1 ? `<img src="${s.logo1}" class="watermark" />` : ''}
                        ${selectedTemplate?.id !== 'adm_form' ? `
                        <div class="header">
                            <img src="${s.logo1}">
                            <div>
                                <h1>${sanitizedSchoolName}</h1>
                                <p>${s.subTitle || 'Institute of Higher Secondary Education'}</p>
                                <p style="font-size: 11pt; color: var(--brand-primary, #003366); font-weight: 900; margin-top: 3px;">${s.location || 'Attock'}</p>
                            </div>
                            <img src="${s.logo2 || s.logo1}">
                        </div>
                        ` : ''}
                        ${contentHtml}
                        ${selectedTemplate?.id !== 'adm_form' ? `
                            <div class="footer">
                                Official School Record • Generated on ${new Date().toLocaleDateString()}
                            </div>
                        ` : ''}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 font-outfit p-4 bg-slate-50 dark:bg-slate-950/20">
            {/* SIDEBAR - STUDIO CONTROLS */}
            <div className="w-[400px] flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar lg:max-h-full">

                {/* 1. LAYER SELECTOR (TABS) */}
                <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none p-5 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                    <div className="flex p-1.5 bg-slate-100/80 dark:bg-black/40 rounded-[1.75rem] mb-5 border border-slate-200/50 dark:border-white/5">
                        {DOCUMENT_GROUPS.map(g => (
                            <button
                                key={g.id}
                                onClick={() => {
                                    setActiveGroup(g.id);
                                    setSelectedTemplate(g.templates[0]);
                                }}
                                className={cn(
                                    "flex-1 py-3 px-1 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex flex-col items-center gap-1.5",
                                    activeGroup === g.id
                                        ? "bg-white dark:bg-brand-primary text-brand-primary dark:text-white shadow-[0_8px_20px_rgba(0,0,0,0.08)] scale-[1.05]"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                )}
                            >
                                <g.icon className={cn("w-4 h-4", activeGroup === g.id ? "animate-pulse" : "")} />
                                {g.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeGroup}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-2"
                            >
                                {DOCUMENT_GROUPS.find(g => g.id === activeGroup)?.templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTemplateSelect(t)}
                                        className={cn(
                                            "w-full text-left px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all border-2 flex items-center justify-between group",
                                            selectedTemplate?.id === t.id
                                                ? "bg-brand-primary/5 border-brand-primary/40 text-brand-primary shadow-sm"
                                                : "bg-transparent border-transparent hover:border-slate-100 dark:hover:border-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300",
                                                selectedTemplate?.id === t.id ? "bg-brand-primary scale-125 shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.5)]" : "bg-slate-200 dark:bg-white/10"
                                            )} />
                                            {t.label}
                                        </div>
                                        <ChevronRight className={cn("w-4 h-4 transition-transform", selectedTemplate?.id === t.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:opacity-40 group-hover:translate-x-0")} />
                                    </button>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* 2. MEDIA & SCANNER */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Assets & Media</h3>
                        </div>
                        {(docImage || wordHtml) && (
                            <button onClick={() => { setDocImage(null); setWordHtml(null); setIsManual(false); }} className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1 hover:underline">
                                <RotateCcw className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {!docImage ? (
                            <label className="group relative border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-300">
                                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:scale-110 transition-all duration-300">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Student Photo</p>
                                    <p className="text-[8px] text-slate-400 mt-0.5 uppercase">JPEG/PNG/HEVC</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        ) : (
                            <div className="relative group rounded-[1.5rem] overflow-hidden border-2 border-brand-primary/20 aspect-square shadow-xl ring-4 ring-brand-primary/5">
                                <img src={docImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                                    <button onClick={() => setDocImage(null)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all transform hover:scale-110">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {!wordHtml ? (
                            <label className="group relative border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300">
                                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Manual Word</p>
                                    <p className="text-[8px] text-slate-400 mt-0.5 uppercase">.docx analyzer</p>
                                </div>
                                <input type="file" className="hidden" accept=".docx" onChange={handleWordUpload} />
                            </label>
                        ) : (
                            <div className="relative group rounded-[1.5rem] bg-blue-500/10 border-2 border-blue-500/20 px-4 flex flex-col items-center justify-center aspect-square text-center shadow-lg ring-4 ring-blue-500/5">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-blue-500/30">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Doc Loaded</p>
                                <div className="absolute inset-0 bg-brand-accent/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm rounded-[1.5rem]">
                                    <X className="text-white w-6 h-6 cursor-pointer hover:scale-125 transition-transform" onClick={() => { setWordHtml(null); setIsManual(false); }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. TARGET SEARCH */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <SearchIcon className="w-4 h-4" />
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Active Recipient</h3>
                    </div>

                    <div className="relative group/search">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <SearchIcon className="w-4 h-4 text-slate-400 group-focus-within/search:text-brand-primary transition-colors" />
                        </div>
                        <input
                            className="w-full bg-slate-50 dark:bg-black/40 rounded-[1.5rem] pl-12 pr-4 py-4 text-xs font-black outline-none border-2 border-transparent focus:border-brand-primary transition-all dark:text-white placeholder:font-normal placeholder:text-slate-400 shadow-inner"
                            placeholder="Type student name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <AnimatePresence>
                            {filteredEntities.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-full mb-3 left-0 right-0 bg-white dark:bg-slate-900 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-white/10 z-[100] overflow-hidden"
                                >
                                    <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3">Quick Suggestions</p>
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {filteredEntities.map(e => (
                                            <button key={e.id} onClick={() => { setTargetEntity(e); setSearchQuery(''); }} className="w-full p-4 hover:bg-brand-primary/5 text-left border-b last:border-0 border-slate-100 dark:border-white/5 transition-all flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-xs uppercase">
                                                    {e.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-[11px] text-slate-800 dark:text-white uppercase tracking-tight">{e.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400">{e.id} • {e.class}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {targetEntity && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-[10px]">
                                    {targetEntity.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-brand-primary uppercase truncate max-w-[150px]">{targetEntity.name}</p>
                                    <p className="text-[8px] font-bold text-slate-500">{targetEntity.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setTargetEntity(null)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* 4. DYNAMIC ADVANCED EDITOR */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 flex-1 flex flex-col min-h-[450px]">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                                <Type className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Design & Content</h3>
                        </div>
                        {isManual && (
                            <button onClick={() => setIsManual(false)} className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1 hover:underline">
                                <RotateCcw className="w-3 h-3" /> System Reset
                            </button>
                        )}
                    </div>

                    <div className="flex-1 space-y-5 overflow-y-auto custom-scrollbar pr-2 pb-6">
                        {/* Designer Field Mapping */}
                        {!isManual && (
                            <div className="space-y-4">
                                {activePlaceholders.map(p => (
                                    <motion.div
                                        key={p}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-1.5"
                                    >
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-3 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/40" />
                                            {p.replace(/[\[\]]/g, '').replace('_', ' ')}
                                        </label>
                                        <textarea
                                            className="w-full bg-slate-50 dark:bg-black/40 rounded-2xl px-5 py-3 text-xs font-black outline-none border-2 border-transparent focus:border-brand-primary transition-all dark:text-white shadow-inner resize-none min-h-[50px] placeholder:font-normal"
                                            rows={1}
                                            placeholder={`Enter ${p.replace(/[\[\]]/g, '').toLowerCase()} here...`}
                                            value={fieldValues[p] || ''}
                                            onChange={(e) => setFieldValues(prev => ({ ...prev, [p]: e.target.value }))}
                                        />
                                    </motion.div>
                                ))}

                                {activePlaceholders.length === 0 && (
                                    <div className="py-10 text-center space-y-3 px-4 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
                                        <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                            <Settings className="w-6 h-6 animate-spin-slow" />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">System is auto-mapping intelligent fields for this template.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ADVANCED MANUAL EDITOR TOGGLE */}
                        <div className="pt-2">
                            {!isManual ? (
                                <button
                                    onClick={enterManualMode}
                                    className="group w-full py-4 rounded-[1.5rem] bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:from-emerald-500 hover:to-teal-600 hover:text-white hover:border-emerald-500 transition-all duration-500 shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/20 flex items-center justify-center gap-3 mb-6"
                                >
                                    <Maximize2 className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                                    Launch Professional Editor
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-slate-50 dark:bg-black/60 rounded-3xl border-2 border-emerald-500 p-1 shadow-2xl overflow-hidden"
                                >
                                    <div className="bg-emerald-500 text-white p-2 px-4 flex items-center justify-between">
                                        <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <FileSignature className="w-3.5 h-3.5" /> Advance Manual Overwrite
                                        </p>
                                        <X className="w-4 h-4 cursor-pointer hover:scale-125 transition-transform" onClick={() => setIsManual(false)} />
                                    </div>
                                    <div className="h-[400px]">
                                        <ReactQuill
                                            theme="snow"
                                            value={manualContent}
                                            onChange={setManualContent}
                                            modules={QUILL_MODULES}
                                            className="h-full bg-white dark:bg-slate-900 border-none rounded-b-2xl manual-quill-editor"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-3">
                        <button onClick={handlePrint} className="w-full py-5 bg-brand-primary text-white rounded-[1.75rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(var(--brand-primary-rgb),0.3)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <Printer className="w-5 h-5 relative z-10 animate-bounce-soft" />
                            <span className="relative z-10">Generate & Print</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* LIVE STUDIO PREVIEW (THE "RENDERER") */}
            <div className="flex-1 bg-white dark:bg-slate-900/40 rounded-[3.5rem] shadow-[inset_0_5px_30px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col relative">

                {/* TOOLBAR CONTROLS */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-white dark:border-white/10">
                    <div className="flex items-center gap-2 px-4 py-1.5 border-r border-slate-100 dark:border-white/5">
                        <Layout className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">A4 Canvas</span>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Zoom</span>
                        <input type="range" min="0.4" max="1.5" step="0.05" value={previewScale} onChange={(e) => setPreviewScale(parseFloat(e.target.value))} className="w-32 accent-brand-primary" />
                        <span className="text-[10px] font-black text-brand-primary min-w-[35px]">{Math.round(previewScale * 100)}%</span>
                    </div>
                    {isManual && (
                        <div className="px-3 border-l border-slate-100 dark:border-white/5">
                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-tighter">Live Edit Mode</div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar p-16 pt-32 flex justify-center items-start bg-slate-100/50 dark:bg-transparent">
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white shadow-[0_60px_120px_-20px_rgba(0,0,0,0.25)] origin-top transition-transform duration-500 w-[210mm] min-h-[297mm] relative text-[#111] overflow-hidden"
                        style={{
                            transform: `scale(${previewScale})`,
                            fontFamily: '"Times New Roman", Times, serif',
                            padding: selectedTemplate?.id === 'adm_form' ? '0' : '2cm'
                        }}
                    >
                        {/* THE "RENDERED" ENGINE */}
                        {selectedTemplate?.id === 'adm_form' ? (
                            <div className="relative h-full group">
                                <div dangerouslySetInnerHTML={{ __html: admissionFormHtmlContent }} className="p-[1cm]" />

                                {/* Overlay to Launch Advanced Form */}
                                <div className="absolute inset-0 bg-brand-primary/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-12 text-center text-white z-[30]">
                                    <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mb-6 ring-4 ring-white/10">
                                        <Maximize2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-widest mb-2 font-outfit">Premium Student Entry</h3>
                                    <p className="text-sm opacity-80 mb-8 max-w-sm leading-relaxed font-outfit">Launch our new high-interaction digital admission portal for a superior enrollment experience.</p>
                                    <button
                                        onClick={() => setShowFullScreenForm(true)}
                                        className="px-12 py-4 bg-[var(--brand-accent)] text-[var(--brand-primary)] rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-110 active:scale-95 transition-all font-outfit"
                                    >
                                        Launch Full Screen Portal
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 h-full">
                                {docImage && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="float-right ml-10 mb-6 border-[8px] border-[#f8fafc] shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5"
                                    >
                                        <img src={docImage} className="w-[160px] h-[190px] object-cover" />
                                    </motion.div>
                                )}
                                <div
                                    className="content-rendered text-[13.5pt] leading-[1.65] text-justify"
                                    dangerouslySetInnerHTML={{ __html: finalContent }}
                                />
                            </div>
                        )}

                        {/* GLOBAL WATERMARK LOGO */}
                        {settings?.logo1 && (
                            <img
                                src={settings.logo1}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] opacity-[0.04] pointer-events-none z-0"
                                alt="watermark"
                            />
                        )}

                        <div className="absolute bottom-[2cm] left-[2cm] right-[2cm] pt-8 border-t border-slate-100/50 flex justify-between items-end opacity-40">
                            <div className="text-[7pt] uppercase tracking-widest font-bold">
                                Authentication Key: PS-${Math.random().toString(36).substr(2, 9).toUpperCase()}
                            </div>
                            <div className="text-[7pt] uppercase tracking-widest font-bold">
                                Page 01 / 01
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="p-4 bg-white/50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Live Engine Synchronized</span>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; border: 2px solid white; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border: 2px solid transparent; }
                .animate-spin-slow { animation: spin 8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-bounce-soft { animation: bounce 2s infinite; }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
                
                .manual-quill-editor .ql-toolbar { border: none !important; border-bottom: 1px solid #f1f5f9 !important; padding: 12px !important; }
                .dark .manual-quill-editor .ql-toolbar { border-bottom: 1px solid rgba(255,255,255,0.05) !important; background: rgba(0,0,0,0.2); }
                .manual-quill-editor .ql-container { border: none !important; font-size: 13px !important; font-family: 'Outfit', sans-serif !important; }
                .dark .manual-quill-editor .ql-editor { color: white; }
                .ql-editor { min-height: 200px !important; }
                
                .content-rendered p { margin-bottom: 1.5em; }
                .content-rendered h1, .content-rendered h2 { margin-bottom: 0.5em; }
            `}</style>

            <AnimatePresence>
                {showFullScreenForm && (
                    <FullScreenStudentForm onClose={() => setShowFullScreenForm(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};
