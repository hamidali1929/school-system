import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';
import { X, Zap, Keyboard, Camera, Search, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../utils/cn';

interface QRScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
    mode: 'Present' | 'Late';
    onModeChange?: (mode: 'Present' | 'Late') => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, mode, onModeChange }) => {
    const { students } = useStore();
    const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
    const [manualId, setManualId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

    // Filtered students for manual search
    const matchedStudent = students.find(s => s.id === manualId || s.id.endsWith(manualId) && manualId.length >= 3);

    const handleManualSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (matchedStudent) {
            onScan(matchedStudent.id);
        } else if (manualId) {
            setError("Identity not found in database.");
            setTimeout(() => setError(null), 3000);
        }
    };

    const startCamera = useCallback(async () => {
        if (codeReaderRef.current) codeReaderRef.current.reset();

        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [0, 11]); // QR_CODE and others
        hints.set(DecodeHintType.TRY_HARDER, true);

        const reader = new BrowserMultiFormatReader(hints);
        codeReaderRef.current = reader;

        try {
            const videoInputDevices = await reader.listVideoInputDevices();
            if (videoInputDevices.length === 0) {
                setError("No camera found.");
                return;
            }

            const backCamera = videoInputDevices.find(device =>
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('rear')
            ) || videoInputDevices[0];

            reader.decodeFromVideoDevice(backCamera.deviceId, videoRef.current!, (result) => {
                if (result) {
                    // Trigger institutional scan success
                    onScan(result.getText());

                    // Visual Neural Blink
                    const overlay = document.getElementById('scan-overlay');
                    if (overlay) {
                        overlay.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                        setTimeout(() => overlay.style.backgroundColor = 'transparent', 200);
                    }
                }
            });
        } catch (err) {
            console.error("Camera error:", err);
            setError("Camera access denied.");
        }
    }, [onScan]); // onScan is now stable from parent via useCallback

    useEffect(() => {
        if (activeTab === 'camera') {
            startCamera();
        } else {
            if (codeReaderRef.current) {
                codeReaderRef.current.reset();
            }
        }

        return () => {
            if (codeReaderRef.current) {
                codeReaderRef.current.reset();
            }
        };
    }, [activeTab, startCamera]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 rounded-[3rem] shadow-[0_0_100px_rgba(30,58,138,0.5)] overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
                {/* Elite Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <Zap className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-[1000] text-[#003366] dark:text-white uppercase tracking-tighter leading-none">
                                {mode} Portal
                            </h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                <span className={cn("w-2 h-2 rounded-full animate-ping", mode === 'Present' ? 'bg-emerald-500' : 'bg-amber-500')}></span>
                                {mode === 'Present' ? 'Marking Presence' : 'Marking Late Arrival'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-2xl transition-all active:scale-90">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tab Switcher & Mode Toggle */}
                <div className="px-8 mb-6 flex flex-col gap-3">
                    <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('camera')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'camera' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm shadow-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Camera className="w-4 h-4" /> Visual Scan
                        </button>
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm shadow-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Keyboard className="w-4 h-4" /> Manual Entry
                        </button>
                    </div>

                    {onModeChange && (
                        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                            <button
                                onClick={() => onModeChange('Present')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    mode === 'Present' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <CheckCircle2 className="w-3 h-3" /> Present
                            </button>
                            <button
                                onClick={() => onModeChange('Late')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    mode === 'Late' ? "bg-amber-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <Clock className="w-3 h-3" /> Late
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-8 pt-0">
                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-8 border-slate-900 shadow-2xl bg-black group flex items-center justify-center">
                        {activeTab === 'camera' ? (
                            <>
                                <video ref={videoRef} className="w-full h-full object-cover" />
                                <div id="scan-overlay" className="absolute inset-0 pointer-events-none border-[30px] border-black/20 transition-colors duration-200"></div>
                                <div className="absolute inset-0 border-2 border-white/5 rounded-[2rem] animate-pulse"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-primary-500/30 rounded-3xl animate-pulse"></div>
                                <div className="absolute left-0 right-0 top-0 h-1 bg-primary-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10 animate-scan-line pointer-events-none"></div>
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-10">
                                <form onSubmit={handleManualSubmit} className="w-full space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Enter ID or Scan Code..."
                                            value={manualId}
                                            onChange={(e) => setManualId(e.target.value.toUpperCase())}
                                            className="w-full pl-16 pr-8 py-6 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:ring-4 ring-primary-500/10 font-black text-xl tracking-widest text-[#003366] dark:text-white transition-all shadow-inner"
                                        />
                                    </div>

                                    {matchedStudent ? (
                                        <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800/40 rounded-3xl animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
                                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Identity Verified</p>
                                                    <p className="font-black text-xl text-slate-800 dark:text-white uppercase leading-tight">{matchedStudent.name}</p>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="px-6 py-4 bg-[#003366] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        </div>
                                    ) : manualId.length > 0 ? (
                                        <div className="text-center py-4 text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">
                                            Searching Registry...
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                            Awaiting Input System
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 z-50 bg-rose-950/90 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                                <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-rose-500/20">
                                    <X className="w-10 h-10 text-white" />
                                </div>
                                <p className="text-white font-black uppercase tracking-widest text-sm mb-2">Neural Access Denied</p>
                                <p className="text-rose-200 text-xs font-bold">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <p className="text-[11px] text-slate-500 font-bold text-center leading-relaxed">
                            {activeTab === 'camera'
                                ? "Visual scanning uses Neural Optical Flow at 60 FPS for instant identification."
                                : "Manual Entry allows instant registry isolation by Student ID or partial ID code."}
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Pioneer Superior Secure Gateway • Attock</p>
                </div>
            </div>

            <style>{`
                @keyframes scan-line {
                    0% { top: 10%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
                .animate-scan-line {
                    animation: scan-line 2.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
