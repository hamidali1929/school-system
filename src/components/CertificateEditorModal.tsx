import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Wand2, Type } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface CertificateEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialNarrative: string;
    onGenerate: (html: string) => void;
    studentName: string;
}

const CertificateEditorModal: React.FC<CertificateEditorModalProps> = ({
    isOpen,
    onClose,
    initialNarrative,
    onGenerate,
    studentName
}) => {
    const [value, setValue] = useState(initialNarrative);

    useEffect(() => {
        if (isOpen) {
            setValue(initialNarrative);
        }
    }, [isOpen, initialNarrative]);

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
        ],
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 z-10"
                    >
                        {/* Header */}
                        <div className="relative px-8 py-6 bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-transparent border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                                    <Wand2 className="w-6 h-6 text-brand-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                        Certificate Studio
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Craft the perfect narrative for {studentName}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Type className="w-4 h-4 text-brand-primary" />
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Achievement Narrative
                                    </label>
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/10 transition-all duration-300 bg-white dark:bg-slate-800">
                                    <ReactQuill 
                                        theme="snow" 
                                        value={value} 
                                        onChange={setValue} 
                                        modules={modules}
                                        className="h-[200px] border-none text-lg [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 dark:[&_.ql-toolbar]:border-slate-700 [&_.ql-container]:border-none [&_.ql-editor]:text-slate-700 dark:[&_.ql-editor]:text-slate-200 [&_.ql-editor]:text-center [&_.ql-editor]:pt-6"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-3 text-center">
                                    Tip: Highlight text to style it. Use variables: [STUDENT_NAME], [COURSE_NAME]. Note: Duration, Phone, and Grade are now beautifully auto-generated in a separate section!
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onGenerate(value);
                                    onClose();
                                }}
                                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-primary/30 flex items-center gap-2 transition-all hover:-translate-y-0.5"
                            >
                                <Printer className="w-4 h-4" />
                                Print Certificate
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CertificateEditorModal;
