import { useState, useEffect } from 'react';
import { Lock, User, GraduationCap, ShieldCheck, Fingerprint } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

export const Login = () => {
    const { settings, login } = useStore();
    const [role, setRole] = useState<'admin' | 'teacher' | 'student'>('admin');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    useEffect(() => {
        const checkBiometric = async () => {
            try {
                const { isAvailable } = await NativeBiometric.isAvailable();
                if (isAvailable) {
                    const result = await NativeBiometric.isCredentialsSaved({ server: 'school_system' });
                    if (result.isSaved) {
                        setBiometricAvailable(true);
                    }
                }
            } catch (e) {
                console.error("Biometric check failed", e);
            }
        };
        checkBiometric();
    }, []);

    const handleBiometricLogin = async () => {
        try {
            await NativeBiometric.verifyIdentity({
                reason: 'Scan fingerprint to access the system',
                title: 'Biometric Login',
                subtitle: 'Use your fingerprint or face to login',
                description: 'Fast and secure access to your portal'
            });
            
            const credentials = await NativeBiometric.getCredentials({ server: 'school_system' });
            const [savedRole, savedId] = credentials.username.split(':');
            const success = login(savedId, credentials.password, savedRole as any);
            
            if (!success) {
                Swal.fire({
                    title: 'Access Denied',
                    text: 'Invalid stored credentials.',
                    icon: 'error',
                    confirmButtonColor: '#003366'
                });
            }
        } catch (error) {
            console.error("Biometric login error", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Use store's login logic
        const success = login(userId, password, role);

        if (!success) {
            Swal.fire({
                title: 'Access Denied',
                text: role === 'admin' ? 'Invalid Administrator credentials.' : role === 'teacher' ? 'Teacher ID not found in institutional records.' : 'Student ID not found in institutional records.',
                icon: 'error',
                confirmButtonColor: '#003366'
            });
        } else {
            // Ask to save credentials if available and not saved
            try {
                const { isAvailable } = await NativeBiometric.isAvailable();
                if (isAvailable) {
                    const saved = await NativeBiometric.isCredentialsSaved({ server: 'school_system' });
                    if (!saved.isSaved) {
                        Swal.fire({
                            title: 'Enable Biometrics?',
                            text: 'Would you like to use Fingerprint/Face ID for quick login next time?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, Enable',
                            cancelButtonText: 'Not Now',
                            confirmButtonColor: '#003366'
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                await NativeBiometric.setCredentials({
                                    username: `${role}:${userId}`,
                                    password: password,
                                    server: 'school_system'
                                });
                                // Toast
                                Swal.fire({
                                    toast: true,
                                    position: 'top-end',
                                    showConfirmButton: false,
                                    timer: 3000,
                                    icon: 'success',
                                    title: 'Biometric login enabled'
                                });
                            }
                        });
                    }
                }
            } catch (e) {
                console.error("Biometric prompt error", e);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden font-outfit">
            {/* Decorative background */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#003366]/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 glass-card overflow-hidden animate-slide-up">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-[#003366] text-white relative">
                    <div className="flex flex-col gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            {settings.logo1 ? (
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl">
                                    <img src={settings.logo1} alt="Logo 1" className="w-full h-full object-contain" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center p-2">
                                    <GraduationCap className="text-white w-8 h-8" />
                                </div>
                            )}

                            {settings.logo2 && (
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl">
                                    <img src={settings.logo2} alt="Logo 2" className="w-full h-full object-contain" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h1 className="font-extrabold text-3xl tracking-tighter uppercase leading-none">
                                <span className="text-white/90">PIONEER'S SUPERIOR</span><br />
                                <span className="text-white/95">Science School & College</span>
                            </h1>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 mt-2 font-bold">{settings.subTitle}</p>
                            <p className="text-[9px] text-white/40 mt-1 font-medium">{settings.location}</p>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-4xl font-black leading-tight mb-4 tracking-tighter uppercase leading-none">Governance <br /> Intelligence <br /> Protocol.</h2>
                        <p className="text-white/70 text-lg font-medium">Step into the {settings.schoolName} institutional governance portal.</p>
                    </div>

                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-black relative z-10 uppercase tracking-[0.2em]">
                        <ShieldCheck className="w-4 h-4" />
                        Institutional Security Protocol: Active
                    </div>

                    {/* Abstract patterns */}
                    <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-[20%] right-[5%] w-32 h-32 border border-white/10 rounded-full"></div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 lg:p-16 flex flex-col justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                    <div className="mb-10 text-center lg:text-left">
                        <div className="lg:hidden flex flex-col items-center gap-4 mb-6">
                            <div className="flex gap-4">
                                {settings.logo1 && (
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl border border-slate-100">
                                        <img src={settings.logo1} alt="Logo 1" className="w-full h-full object-contain" />
                                    </div>
                                )}
                                {settings.logo2 && (
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl border border-slate-100">
                                        <img src={settings.logo2} alt="Logo 2" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <h3 className="text-3xl font-black mb-2 tracking-tight uppercase text-slate-800 dark:text-white">System Access</h3>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Provide your institutional digital keys.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-3 gap-2 mb-8">
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={cn(
                                    "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 px-1",
                                    role === 'admin' ? "bg-[#003366] text-white border-[#003366] shadow-lg shadow-blue-500/20" : "bg-white dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-[#003366]/30"
                                )}
                            >
                                Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('teacher')}
                                className={cn(
                                    "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 px-1",
                                    role === 'teacher' ? "bg-[#003366] text-white border-[#003366] shadow-lg shadow-blue-500/20" : "bg-white dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-[#003366]/30"
                                )}
                            >
                                Teacher
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={cn(
                                    "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 px-1",
                                    role === 'student' ? "bg-[#003366] text-white border-[#003366] shadow-lg shadow-blue-500/20" : "bg-white dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-[#003366]/30"
                                )}
                            >
                                Student
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#003366] dark:text-blue-400 ml-1">Governance Identity</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#003366] transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder={role === 'admin' ? "admin" : role === 'teacher' ? "TCH-XXXX" : "STU-XXXX"}
                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 ring-[#003366] transition-all font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#003366] ml-1">Security Token</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#003366] transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 ring-[#003366] transition-all font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                className="w-full py-4 bg-[#003366] hover:bg-blue-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                            >
                                Open Institutional Link
                            </button>

                            {biometricAvailable && (
                                <button
                                    type="button"
                                    onClick={handleBiometricLogin}
                                    className="w-full py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#003366] dark:text-blue-400 font-black uppercase tracking-widest rounded-2xl shadow-lg border-2 border-slate-100 dark:border-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Fingerprint className="w-5 h-5" />
                                    <span>Login with Biometrics</span>
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Public Online Admission Link for Parents */}
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                window.location.hash = '#/apply';
                            }}
                            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <span>📝 Parents: Apply Online for Admission (2026-27)</span>
                        </button>
                        <p className="text-[10px] text-slate-400 font-bold mt-2">
                            New students & parents can fill online form directly.
                        </p>
                    </div>

                    <p className="mt-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        © 2026 {settings.schoolName} <br />
                        CLEARANCE: ALPHA-4 AUTHORIZED
                    </p>
                </div>
            </div>
        </div>
    );
};
