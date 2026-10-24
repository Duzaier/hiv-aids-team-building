'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  Download,
  AlertCircle,
  PlusCircle,
  Loader2
} from 'lucide-react';

interface ExportRow {
  stt: number;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  teamName: string;
  slotNumber: number | string;
  role: string;
  registrationType: string;
  registeredAt: string;
}

interface ExportStats {
  totalRows: number;
  teamCount: number;
  teamMembersCount: number;
  waitingIndividualsCount: number;
  assignedIndividualsCount: number;
}

interface ExportGoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowNotice?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ExportGoogleSheetModal: React.FC<ExportGoogleSheetModalProps> = ({
  isOpen,
  onClose,
  onShowNotice
}) => {
  const [loading, setLoading] = useState(true);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [rows, setRows] = useState<ExportRow[]>([]);
  const [stats, setStats] = useState<ExportStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch export data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setCopied(false);

    fetch('/api/admin/export')
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Lỗi tải dữ liệu (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setRows(data.rows || []);
          setStats(data.stats || null);
        } else {
          setError(data.error || 'Không thể lấy dữ liệu xuất.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Có lỗi kết nối máy chủ khi lấy dữ liệu xuất.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate Decorated HTML Table for rich clipboard pasting
  const generateDecoratedHTML = () => {
    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    const rowsHtml = rows
      .map((r, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        return `
        <tr style="background-color: ${bg};">
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: center; color: #64748b; font-family: Arial, sans-serif; font-size: 10pt;">${r.stt}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; font-weight: bold; color: #0f172a; font-family: Arial, sans-serif; font-size: 10pt;">${r.name}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: center; color: #2563eb; font-weight: 600; font-family: Arial, sans-serif; font-size: 10pt;">${r.studentId || '—'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; color: #334155; font-family: Arial, sans-serif; font-size: 10pt;">${r.email}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: center; color: #059669; font-weight: 600; font-family: Arial, sans-serif; font-size: 10pt;">${r.phone || '—'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: center; color: #7c3aed; font-weight: bold; font-family: Arial, sans-serif; font-size: 10pt;">${r.teamName}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: center; color: #0f172a; font-family: Arial, sans-serif; font-size: 10pt;">${r.role}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: center; color: #475569; font-family: Arial, sans-serif; font-size: 10pt;">${r.registrationType}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: center; color: #64748b; font-family: Arial, sans-serif; font-size: 10pt;">${r.registeredAt}</td>
        </tr>
      `;
      })
      .join('');

    return `
      <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead>
          <tr>
            <th colspan="9" style="background-color: #dc2626; color: #ffffff; font-size: 15pt; font-weight: bold; text-align: center; padding: 14px 10px; border: 1px solid #b91c1c; font-family: Arial, sans-serif;">
              HỘI THAO &amp; TEAM BUILDING 2026 — CHUNG TAY ĐẨY LÙI HIV/AIDS
            </th>
          </tr>
          <tr>
            <th colspan="9" style="background-color: #991b1b; color: #ffffff; font-size: 10.5pt; font-style: italic; font-weight: normal; text-align: center; padding: 8px 10px; border: 1px solid #7f1d1d; font-family: Arial, sans-serif;">
              DANH SÁCH TỔNG HỢP VẬN ĐỘNG VIÊN &amp; CÁ NHÂN ĐĂNG KÝ (Thời điểm xuất: ${now})
            </th>
          </tr>
          <tr style="height: 10px;">
            <td colspan="9" style="border: none; background-color: #ffffff;"></td>
          </tr>
          <tr style="background-color: #0f172a; color: #ffffff;">
            <th style="background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 10px 12px; border: 1px solid #334155; text-align: center; font-size: 10pt;">STT</th>
            <th style="background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 10px 12px; border: 1px solid #334155; text-align: left; font-size: 10pt;">Họ và tên</th>
            <th style="background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 10px 12px; border: 1px solid #334155; text-align: center; font-size: 10pt;">MSSV</th>
            <th style="background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 10px 12px; border: 1px solid #334155; text-align: left; font-size: 10pt;">Email (Gmail)</th>
            <th style="background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 10px 12px; border: 1px solid #334155; text-align: center; font-size: 10pt;">Số điện thoại (Zalo)</th>
            <th style="background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 10px 12px; border: 1px solid #334155; text-align: center; font-size: 10pt;">Đội tham gia</th>
            <th style="background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 10px 12px; border: 1px solid #334155; text-align: center; font-size: 10pt;">Vai trò</th>
            <th style="background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 10px 12px; border: 1px solid #334155; text-align: center; font-size: 10pt;">Hình thức đăng ký</th>
            <th style="background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 10px 12px; border: 1px solid #334155; text-align: center; font-size: 10pt;">Thời gian ghi danh</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  };

  // Convert rows to TSV format for plain fallback
  const generateTSV = () => {
    const headers = [
      'STT',
      'Họ và tên',
      'MSSV',
      'Email (Gmail)',
      'Số điện thoại (Zalo)',
      'Đội tham gia',
      'Vai trò',
      'Hình thức đăng ký',
      'Thời gian ghi danh'
    ];

    const dataRows = rows.map((r) => [
      r.stt,
      r.name,
      r.studentId,
      r.email,
      r.phone,
      r.teamName,
      r.role,
      r.registrationType,
      r.registeredAt
    ]);

    return [headers, ...dataRows].map((row) => row.join('\t')).join('\n');
  };

  // Convert rows to CSV format for download
  const generateCSV = () => {
    const headers = [
      'STT',
      'Họ và tên',
      'MSSV',
      'Email (Gmail)',
      'Số điện thoại (Zalo)',
      'Đội tham gia',
      'Vai trò',
      'Hình thức đăng ký',
      'Thời gian ghi danh'
    ];

    const escapeCSV = (val: any) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const dataRows = rows.map((r) => [
      r.stt,
      r.name,
      r.studentId,
      r.email,
      r.phone,
      r.teamName,
      r.role,
      r.registrationType,
      r.registeredAt
    ]);

    return '\uFEFF' + [headers, ...dataRows].map((row) => row.map(escapeCSV).join(',')).join('\n');
  };

  // Automated Action: Create Brand New Sheet & Auto-populate All Data
  const handleAutoCreateAndFillSheet = async () => {
    if (isCreatingSheet) return;
    setIsCreatingSheet(true);

    // Open target blank window synchronously to prevent browser popup blockers
    const newTab = window.open('about:blank', '_blank');

    try {
      const res = await fetch('/api/admin/export/create-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || 'Không thể tạo và điền dữ liệu vào sheet mới.');
      }

      // Navigate opened tab to the freshly populated spreadsheet
      if (newTab) {
        newTab.location.href = data.url;
      } else {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }

      if (onShowNotice) {
        onShowNotice('success', `Đã tạo Google Sheet mới và tự động điền sẵn ${data.rowCount} người tham gia!`);
      }
    } catch (err: any) {
      console.error('[Create Sheet Error]:', err);
      if (newTab) newTab.close();

      const errMsg = err?.message || 'Có lỗi khi tự động tạo sheet mới.';
      setError(errMsg);
      if (onShowNotice) {
        onShowNotice('error', errMsg);
      }
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Secondary Action: Only copy to clipboard
  const handleOnlyCopyData = async () => {
    const tsvData = generateTSV();
    const htmlData = generateDecoratedHTML();

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlData], { type: 'text/html' });
        const textBlob = new Blob([tsvData], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
          })
        ]);
      } else {
        await navigator.clipboard.writeText(tsvData);
      }
      setCopied(true);
      if (onShowNotice) {
        onShowNotice('success', 'Đã sao chép bảng dữ liệu đã decor vào clipboard!');
      }
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      await navigator.clipboard.writeText(tsvData);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Secondary Action: Download CSV
  const handleDownloadCSV = () => {
    const csvData = generateCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `danh_sach_team_building_hiv_aids_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onShowNotice) {
      onShowNotice('success', 'Đã tải xuống file CSV thành công!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Sleek Minimal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-bold text-white">Xuất Google Sheet</h3>
                {stats && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{stats.totalRows} người</span>
                    <span>•</span>
                    <span className="text-blue-400">{stats.teamMembersCount} đã vào đội</span>
                    {stats.waitingIndividualsCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400">{stats.waitingIndividualsCount} chờ ghép</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Tự động tạo bảng tính mới và điền sẵn toàn bộ dữ liệu &amp; banner decor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Minimal 1-line hint */}
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">Tự động:</span>
            <span>Bấm nút xuất, hệ thống sẽ tự động tạo bảng tính mới và điền sẵn toàn bộ thông tin.</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAutoCreateAndFillSheet}
              disabled={loading || rows.length === 0 || isCreatingSheet}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isCreatingSheet ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tạo &amp; điền sheet...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo Sheet Mới &amp; Xuất</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </>
              )}
            </button>

            <button
              onClick={handleOnlyCopyData}
              disabled={loading || rows.length === 0 || isCreatingSheet}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Sao chép bảng dữ liệu đã decor vào bộ nhớ tạm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã Chép!' : 'Chép Bảng'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              disabled={loading || rows.length === 0 || isCreatingSheet}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Tải file CSV tiếng Việt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải CSV</span>
            </button>
          </div>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table Content (Maximized, Clean, Minimal) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden shadow-inner">
            {/* Banner Header Decor in Table */}
            <div className="bg-red-600 text-white font-extrabold text-center py-2.5 px-4 text-xs sm:text-sm tracking-wide">
              HỘI THAO &amp; TEAM BUILDING 2026 — CHUNG TAY ĐẨY LÙI HIV/AIDS
            </div>
            <div className="bg-red-800 text-red-100 text-[11px] italic text-center py-1 px-4 border-b border-red-900/50">
              DANH SÁCH TỔNG HỢP VẬN ĐỘNG VIÊN &amp; CÁ NHÂN ĐĂNG KÝ
            </div>

            {/* Data Rows */}
            <div className="overflow-x-auto max-h-[46vh]">
              {loading ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-slate-200 rounded-full animate-spin mb-2" />
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : rows.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Chưa có dữ liệu người tham gia để xuất.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-white font-bold sticky top-0 z-10">
                      <th className="py-2.5 px-3 text-center border-r border-slate-800">STT</th>
                      <th className="py-2.5 px-3 border-r border-slate-800">Họ và tên</th>
                      <th className="py-2.5 px-3 text-center border-r border-slate-800">MSSV</th>
                      <th className="py-2.5 px-3 border-r border-slate-800">Email</th>
                      <th className="py-2.5 px-3 text-center border-r border-slate-800">SĐT</th>
                      <th className="py-2.5 px-3 text-center border-r border-slate-800">Đội</th>
                      <th className="py-2.5 px-3 text-center border-r border-slate-800">Vai trò</th>
                      <th className="py-2.5 px-3 text-center">Hình thức</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {rows.map((r) => (
                      <tr key={r.stt} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 text-slate-500 text-center font-mono border-r border-slate-800/50">
                          {r.stt}
                        </td>
                        <td className="py-2 px-3 font-semibold text-white whitespace-nowrap border-r border-slate-800/50">
                          {r.name}
                        </td>
                        <td className="py-2 px-3 font-mono text-blue-300 text-center whitespace-nowrap border-r border-slate-800/50">
                          {r.studentId || '—'}
                        </td>
                        <td className="py-2 px-3 text-slate-400 whitespace-nowrap border-r border-slate-800/50">
                          {r.email}
                        </td>
                        <td className="py-2 px-3 font-mono text-emerald-400 text-center whitespace-nowrap border-r border-slate-800/50">
                          {r.phone || '—'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-purple-300 text-center whitespace-nowrap border-r border-slate-800/50">
                          {r.teamName}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap border-r border-slate-800/50">
                          {r.role}
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-center whitespace-nowrap">
                          {r.registrationType}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Tự động tạo file và điền thông tin vào Google Drive của bạn.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
