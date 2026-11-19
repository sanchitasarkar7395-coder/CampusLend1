import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { HOSTEL_BLOCKS } from '../data/mockData';
import { isFirebaseConfigured, signInWithGooglePopup } from '../firebase';
import { StudentProfile } from '../types';
import { UserAvatar } from './UserAvatar';

interface VerifyStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSignInSuccess: (updated: StudentProfile) => void;
  onVerifySuccess: (updated: StudentProfile) => void;
  onSignOut: () => void;
}

type ModalStep = 'login' | 'verify' | 'summary';

const DEMO_GOOGLE_AVATAR_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="48" fill="#1E3A8A"/>
      <circle cx="48" cy="37" r="16" fill="#DBEAFE"/>
      <path d="M22 82c4-15 15-23 26-23s22 8 26 23" fill="#DBEAFE"/>
      <circle cx="74" cy="74" r="11" fill="#10B981" stroke="#FFFFFF" stroke-width="3"/>
    </svg>`
  );

function GoogleLogo() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export function VerifyStudentModal({
  isOpen,
  onClose,
  profile,
  onSignInSuccess,
  onVerifySuccess,
  onSignOut,
}: VerifyStudentModalProps) {
  const [step, setStep] = useState<ModalStep>('login');
  const [gmail, setGmail] = useState(profile.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [hostelBlock, setHostelBlock] = useState(profile.hostelBlock || 'Boys Hostel B');
  const [rollNumber, setRollNumber] = useState(profile.rollNumber || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGmail(profile.email || '');
      setPassword('');
      setShowPassword(false);
      setIsAuthenticating(false);
      setFullName(profile.fullName || 'Aarav Sharma');
      setHostelBlock(profile.hostelBlock || 'Boys Hostel B');
      setRollNumber(profile.rollNumber || '');
      setError('');

      if (!profile.isSignedIn) {
        setStep('login');
      } else if (!profile.isVerified) {
        setStep('verify');
      } else {
        setStep('summary');
      }
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleFirebaseGoogleSignIn = async () => {
    setError('');
    if (!isFirebaseConfigured) {
      setError(
        'Firebase credentials in src/firebase.ts are still set to placeholders. Paste your apiKey, authDomain, and projectId to enable live Google popups — or click "Demo Google Sign-In" below.'
      );
      return;
    }

    setIsAuthenticating(true);
    try {
      const user = await signInWithGooglePopup();
      const updated: StudentProfile = {
        ...profile,
        uid: user.uid,
        fullName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        isSignedIn: true,
        authMethod: 'google',
      };
      setGmail(user.email);
      setFullName(user.displayName);
      onSignInSuccess(updated);
      setStep(updated.isVerified ? 'summary' : 'verify');
    } catch (err) {
      const authErr = err as { code?: string; message?: string };
      if (authErr.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completing sign-in.');
      } else if (authErr.code === 'auth/unauthorized-domain') {
        setError(
          'This preview domain is not authorized in your Firebase project yet. Add it under Firebase Console -> Authentication -> Settings -> Authorized domains, or use Demo Google Sign-In.'
        );
      } else {
        setError(
          authErr.message ||
            'Could not complete Google Sign-In. Check your Firebase config or use Demo Google Sign-In.'
        );
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDemoGoogleSignIn = () => {
    const chosenEmail =
      gmail.trim().toLowerCase().endsWith('@gmail.com') && gmail.trim().length >= 12
        ? gmail.trim().toLowerCase()
        : 'aarav.sharma.ddn@gmail.com';

    const updated: StudentProfile = {
      ...profile,
      uid: 'demo-google-uid-0251',
      fullName: 'Aarav Sharma',
      email: chosenEmail,
      photoURL: DEMO_GOOGLE_AVATAR_SVG,
      isSignedIn: true,
      authMethod: 'demo_google',
    };
    setGmail(chosenEmail);
    setFullName(updated.fullName);
    setError('');
    onSignInSuccess(updated);
    setStep(updated.isVerified ? 'summary' : 'verify');
  };

  const handleManualGmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedEmail = gmail.trim().toLowerCase();
    if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(cleanedEmail)) {
      setError('Please enter a valid Gmail address ending in @gmail.com.');
      return;
    }
    if (password.trim().length < 4) {
      setError('Please enter your password (at least 4 characters).');
      return;
    }

    const derivedName =
      profile.fullName && profile.fullName !== 'Aarav Sharma'
        ? profile.fullName
        : cleanedEmail
            .split('@')[0]
            .replace(/[._-]+/g, ' ')
            .replace(/\b\w/g, (ch) => ch.toUpperCase());

    const updated: StudentProfile = {
      ...profile,
      uid: `gmail-${Date.now()}`,
      email: cleanedEmail,
      fullName: derivedName,
      photoURL: '',
      isSignedIn: true,
      authMethod: 'password',
    };
    setFullName(derivedName);
    setError('');
    onSignInSuccess(updated);
    setStep(updated.isVerified ? 'summary' : 'verify');
  };

  const handleFillSampleStudent = () => {
    setFullName(profile.fullName || 'Aarav Sharma');
    setHostelBlock('Boys Hostel B');
    setRollNumber('0251MBA183');
    setError('');
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedHostel = hostelBlock.trim();
    const trimmedRoll = rollNumber.trim().toUpperCase();

    if (trimmedName.length < 2) {
      setError('Please enter your full name as printed on your College Student ID.');
      return;
    }
    if (trimmedHostel.length < 2) {
      setError('Please enter your Hostel or PG name (e.g., Boys Hostel B or Prem Nagar PG).');
      return;
    }
    if (!/^[A-Z0-9-]{5,16}$/.test(trimmedRoll)) {
      setError('Enter a valid College Student ID / Roll Number (e.g., 0251MBA183).');
      return;
    }

    onVerifySuccess({
      ...profile,
      email: gmail || profile.email || 'aarav.sharma.ddn@gmail.com',
      fullName: trimmedName,
      hostelBlock: trimmedHostel,
      rollNumber: trimmedRoll,
      isSignedIn: true,
      isVerified: true,
      verifiedAt: 'Verified · Nov 2026',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile sheet drag bar */}
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#1E3A8A] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>CampusLend · Google Auth &amp; Student Trust Layer</span>
            </div>
            <h2
              id="verify-modal-title"
              className="font-display text-xl font-bold text-slate-900 tracking-tight"
            >
              {step === 'login'
                ? 'Sign in with Google / Gmail'
                : step === 'verify'
                  ? 'Verify Student Status'
                  : 'Verified Student Account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* STEP 1: FIREBASE GOOGLE AUTH + DEMO FALLBACK + MANUAL GMAIL */}
          {step === 'login' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Sign in with your Google account to sync your name, Gmail, and profile photo across
                campus bookings and gear listings.
              </p>

              {/* Primary Real Firebase Google Sign-In */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={isAuthenticating}
                  onClick={handleFirebaseGoogleSignIn}
                  className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.99] text-sm font-semibold text-slate-900 flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
                      <span>Opening Google Sign-In...</span>
                    </>
                  ) : (
                    <>
                      <GoogleLogo />
                      <span>Continue with Google (Firebase Auth)</span>
                    </>
                  )}
                </button>

                {/* Fallback Demo Google Sign-In so preview works even before Firebase keys are pasted */}
                <button
                  type="button"
                  onClick={handleDemoGoogleSignIn}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Demo Google Sign-In (Instant Preview)</span>
                </button>

                {!isFirebaseConfigured && (
                  <p className="text-xs text-slate-500 leading-relaxed px-1">
                    Firebase keys in <code className="font-mono text-slate-700">src/firebase.ts</code>{' '}
                    use placeholders right now. Paste your <code className="font-mono">apiKey</code>,{' '}
                    <code className="font-mono">authDomain</code>, and{' '}
                    <code className="font-mono">projectId</code> for live Google popups, or test
                    immediately with Demo Google Sign-In.
                  </p>
                )}
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 leading-relaxed"
                >
                  {error}
                </p>
              )}

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200" />
                <span className="px-3 text-xs text-slate-400 bg-white">
                  or sign in manually with Gmail
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* Manual Gmail + Password Form */}
              <form onSubmit={handleManualGmailSignIn} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="login-gmail"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Gmail Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-gmail"
                      type="email"
                      required
                      value={gmail}
                      onChange={(e) => setGmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full min-h-[44px] pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full min-h-[44px] pl-3.5 pr-11 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[46px] rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Sign In with Gmail
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: STUDENT TRUST VERIFICATION */}
          {step === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar
                    name={profile.fullName || fullName}
                    photoURL={profile.photoURL}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-950 truncate">
                      {profile.fullName || fullName}
                    </p>
                    <p className="text-[11px] font-mono text-emerald-800 truncate">
                      {profile.email || gmail}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    setStep('login');
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Switch
                </button>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Enter your hostel and college roll number to unlock your{' '}
                <strong className="text-slate-900">Verified Student</strong> badge for peer rentals
                and lending.
              </p>

              <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-600">
                  Quick demo? Auto-fill sample student ID.
                </span>
                <button
                  type="button"
                  onClick={handleFillSampleStudent}
                  className="text-xs font-semibold text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0 ml-3 cursor-pointer"
                >
                  Fill Sample ID
                </button>
              </div>

              <div>
                <label
                  htmlFor="verify-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="verify-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Aarav Sharma"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="verify-hostel"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Hostel / PG Name
                </label>
                <input
                  id="verify-hostel"
                  type="text"
                  list="hostel-suggestions"
                  required
                  value={hostelBlock}
                  onChange={(e) => setHostelBlock(e.target.value)}
                  placeholder="e.g., Boys Hostel B, Girls Hostel A, Prem Nagar PG"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                />
                <datalist id="hostel-suggestions">
                  {HOSTEL_BLOCKS.map((block) => (
                    <option key={block} value={block} />
                  ))}
                </datalist>
              </div>

              <div>
                <label
                  htmlFor="verify-roll"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  College Student ID / Roll Number
                </label>
                <input
                  id="verify-roll"
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., 0251MBA183"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
                >
                  {error}
                </p>
              )}

              <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="sm:w-1/3 min-h-[46px] rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Later
                </button>
                <button
                  type="submit"
                  className="sm:w-2/3 min-h-[46px] rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Verified Student Badge</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: VERIFIED ACCOUNT SUMMARY */}
          {step === 'summary' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3.5">
                <UserAvatar
                  name={profile.fullName}
                  photoURL={profile.photoURL}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <p className="text-sm font-semibold text-emerald-950 truncate">
                      Verified Student Badge Active
                    </p>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5 truncate">
                    {profile.authMethod === 'google'
                      ? 'Synced with Firebase Google Auth'
                      : profile.authMethod === 'demo_google'
                        ? 'Synced with Demo Google Sign-In'
                        : 'Signed in via Gmail'}
                  </p>
                </div>
              </div>

              <dl className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <dt className="text-xs text-slate-500">Full Name</dt>
                  <dd className="text-sm font-semibold text-slate-900">{profile.fullName}</dd>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <dt className="text-xs text-slate-500">Google / Gmail</dt>
                  <dd className="text-sm font-mono text-slate-800 truncate">{profile.email}</dd>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <dt className="text-xs text-slate-500">Student ID / Roll No.</dt>
                  <dd className="text-sm font-mono font-semibold text-[#1E3A8A] tabular-nums">
                    {profile.rollNumber}
                  </dd>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <dt className="text-xs text-slate-500">Hostel / PG Name</dt>
                  <dd className="text-sm font-medium text-slate-900">{profile.hostelBlock}</dd>
                </div>
              </dl>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep('verify')}
                  className="sm:flex-1 min-h-[44px] rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Edit Student ID
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    setStep('login');
                  }}
                  className="sm:flex-1 min-h-[44px] rounded-xl border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
