'use client';

import React, { useState, useEffect } from 'react';
import { User, IndividualRegistration } from '@/types';
import {
  X,
  Edit3,
  UserPlus,
  User as UserIcon,
  GraduationCap,
  Mail,
  Phone,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface IndividualRegistrationModalProps {
  isOpen: boolean;
  currentUser: User | null;
  initialData?: IndividualRegistration | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const IndividualRegistrationModal: React.FC<IndividualRegistrationModalProps> = ({
  isOpen,
  currentUser,
  initialData,
  onClose,
  onSuccess
}) => {
  const isEdit = Boolean(initialData?.id);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setStudentId(initialData.studentId || '');
        setEmail(initialData.email || '');
        setPhone(initialData.phone || '');
      } else {
        setName(currentUser?.name || '');
        setStudentId('');
        setEmail(currentUser?.email || '');
        setPhone('');
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, currentUser, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanStudentId = studentId.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('Vui l?ng nh?p H? v? t?n c?a b?n');
      return;
    }
    if (!cleanStudentId) {
      setError('Vui l?ng nh?p MSSV (M? s? sinh vi?n)');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Vui l?ng nh?p ??a ch? Gmail h?p l?');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Vui l?ng nh?p S? ?i?n tho?i (Zalo) h?p l? ?? Ban T? Ch?c li?n h?');
      return;
    }

    try {
      setIsSubmitting(true);
      const method = isEdit ? 'PATCH' : 'POST';
      const payload = isEdit
        ? { id: initialData?.id, name: cleanName, studentId: cleanStudentId, email: cleanEmail, phone: cleanPhone }
        : { name: cleanName, studentId: cleanStudentId, email: cleanEmail, phone: cleanPhone };

      const res = await fetch('/api/individuals', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        if (!isEdit && result.individual?.id && typeof window !== 'undefined') {
          try {
            localStorage.setItem('my_individual_reg_id', result.individual.id);
          } catch (e) {}
        }
        onClose();
        onSuccess(result.message || (isEdit ? 'C?p nh?t th?ng tin th?nh c?ng!' : '??ng k? di?n c? nh?n th?nh c?ng!'));
      } else {
        setError(result.error || (isEdit ? 'C?p nh?t th?t b?i. Vui l?ng th? l?i.' : '??ng k? th?t b?i. Vui l?ng th? l?i.'));
      }
    } catch (err: any) {
      setError(err?.message || 'C? l?i k?t n?i m?y ch?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20 shrink-0">
              {isEdit ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                {isEdit ? 'Ch?nh S?a Th?ng Tin' : 'D?nh Cho Ng??i Ch?a C? Nh?m'}
              </span>
              <h3 className="text-lg font-black text-white">
                {isEdit ? 'S?a ??ng K? C? Nh?n' : '??ng K? Di?n C? Nh?n'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="??ng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 leading-relaxed flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
          <span>
            {isEdit
              ? 'B?n c? th? ch?nh s?a l?i H? t?n, MSSV, Gmail ho?c S?T (Zalo) n?u l? ?i?n sai. H? th?ng s? t? ??ng ??ng b? sang ??i thi ??u n?u b?n ?? ???c x?p v?o ??i.'
              : 'B?n s? ???c ??a v?o danh s?ch ch? gh?p ??i t? do. Ban T? Ch?c s? gh?p ng?u nhi?n b?n v?o c?c ??i c?n tr?ng slot (d??i 5 th?nh vi?n).'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-slate-200 font-semibold mb-1 flex items-center gap-1.5">
              <UserIcon className="w-3 h-3 text-slate-400" />
              <span>H? v? t?n</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: Nguy?n V?n An"
              required
              maxLength={50}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-white placeholder-slate-600 transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-200 font-semibold mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3 h-3 text-blue-400" />
              <span>MSSV (M? s? sinh vi?n)</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: SE170123"
              required
              maxLength={20}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-white placeholder-slate-600 font-mono transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-200 font-semibold mb-1 flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>??a ch? Gmail</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: an.nv@gmail.com"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-white placeholder-slate-600 transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-200 font-semibold mb-1 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>S? ?i?n tho?i (Zalo)</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: 0912345678"
              required
              maxLength={20}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-white placeholder-slate-600 transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-semibold cursor-pointer"
            >
              H?y
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:opacity-95 text-white font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer border border-rose-500/30"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isEdit ? '?ang l?u...' : '?ang g?i...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'L?U THAY ??I' : '??NG K?'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
