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
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCheck
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
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [rows, setRows] = useState<ExportRow[]>([]);
  const [stats, setStats] = useState<ExportStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pasteGuide, setPasteGuide] = useState(false);
  const [showAppsScriptGuide, setShowAppsScriptGuide] = useState(false);

  // Fetch export data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setCopied(false);
    setPasteGuide(false);

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

  // Generate Decorated HTML Table for rich clipboard pasting into Google Sheets / Excel
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
              TEAM BUILDING 2026 — CHUNG TAY ĐẨY LÙI HIV/AIDS
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

  // Helper to copy rich table data to clipboard
  const copyTableToClipboard = async (): Promise<boolean> => {
    const tsvData = generateTSV();
    const htmlData = generateDecoratedHTML();

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlData], { type: 'text/html' });
        const textBlob = new Blob([tsvData], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
          })
        ]);
        return true;
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(tsvData);
        return true;
      }
    } catch (clipErr) {
      console.warn('Clipboard write warning:', clipErr);
      try {
        await navigator.clipboard.writeText(tsvData);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  // Action 1: Open Google Sheet & Pre-copy Data for 1-Key Paste (Ctrl + V)
  const handleOpenGoogleSheetWithClipboard = async () => {
    if (isCreatingSheet) return;
    setIsCreatingSheet(true);
    setError(null);

    // 1. Pre-copy rich styled table to clipboard immediately inside user click gesture
    await copyTableToClipboard();
    setCopied(true);

    // 2. Open new tab synchronously to bypass browser popup blockers
    const newTab = window.open('about:blank', '_blank');

    try {
      const res = await fetch('/api/admin/export/create-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json().catch(() => ({}));
      const targetUrl = data?.url || 'https://sheets.new';

      if (newTab) {
        newTab.location.href = targetUrl;
      } else {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }

      setPasteGuide(true);
      if (onShowNotice) {
        onShowNotice(
          'success',
          data?.method === 'APPS_SCRIPT_DIRECT'
            ? 'Đã tạo file Google Sheet trong Drive thành công!'
            : 'Đã mở tab Google Sheet! Bấm Ctrl + V vào ô A1 để dán bảng dữ liệu.'
        );
      }
    } catch (err: any) {
      console.warn('[Open Sheet Notice]:', err);
      if (newTab) {
        newTab.location.href = 'https://sheets.new';
      }
      setPasteGuide(true);
      if (onShowNotice) {
        onShowNotice('success', 'Đã mở tab Google Sheet! Bấm Ctrl + V vào ô A1 để dán bảng dữ liệu.');
      }
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Action 2: Download Full Excel (.xlsx) file with pre-filled styled data
  const handleDownloadXLSX = async () => {
    if (isExportingExcel || rows.length === 0) return;
    try {
      setIsExportingExcel(true);
      const XLSX = await import('xlsx');
      const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

      const data: (string | number)[][] = [
        ['TEAM BUILDING 2026 — CHUNG TAY ĐẨY LÙI HIV/AIDS'],
        [`DANH SÁCH TỔNG HỢP VẬN ĐỘNG VIÊN & CÁ NHÂN ĐĂNG KÝ (Thời điểm xuất: ${now})`],
        [],
        ['STT', 'Họ và tên', 'MSSV', 'Email (Gmail)', 'Số điện thoại (Zalo)', 'Đội tham gia', 'Vai trò', 'Hình thức đăng ký', 'Thời gian ghi danh']
      ];

      rows.forEach((r) => {
        data.push([
          r.stt,
          r.name,
          r.studentId || '—',
          r.email,
          r.phone || '—',
          r.teamName,
          r.role,
          r.registrationType,
          r.registeredAt
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(data);

      // Merge header banner
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }
      ];

      // Auto column widths
      ws['!cols'] = [
        { wch: 6 },  // STT
        { wch: 25 }, // Họ tên
        { wch: 14 }, // MSSV
        { wch: 28 }, // Email
        { wch: 16 }, // SĐT
        { wch: 18 }, // Đội
        { wch: 22 }, // Vai trò
        { wch: 22 }, // Hình thức
        { wch: 20 }  // Thời gian
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách VĐV');

      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `danh_sach_team_building_hiv_aids_${dateStr}.xlsx`);

      if (onShowNotice) {
        onShowNotice('success', 'Đã tải file Excel (.xlsx) có sẵn 100% dữ liệu!');
      }
    } catch (err: any) {
      console.error('Error generating Excel file:', err);
      if (onShowNotice) {
        onShowNotice('error', 'Có lỗi khi xuất file Excel.');
      }
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Action 3: Only Copy rich table to clipboard
  const handleOnlyCopyData = async () => {
    const success = await copyTableToClipboard();
    if (success) {
      setCopied(true);
      if (onShowNotice) {
        onShowNotice('success', 'Đã sao chép bảng dữ liệu vào Clipboard! Có thể dán vào Excel / Sheets / Word.');
      }
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Action 4: Download CSV
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
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Sleek Minimal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-bold text-white">Xuất Bảng Dữ Liệu</h3>
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
                Xuất trực tiếp sang Google Sheet, tải file Excel (.xlsx) hoặc sao chép nhanh
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
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Action 1: Open Google Sheet */}
            <button
              onClick={handleOpenGoogleSheetWithClipboard}
              disabled={loading || rows.length === 0 || isCreatingSheet}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Mở Google Sheet mới và tự động chép sẵn bảng dữ liệu để bạn bấm Ctrl + V"
            >
              {isCreatingSheet ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang mở Google Sheet...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Mở Google Sheet &amp; Dán</span>
                </>
              )}
            </button>

            {/* Primary Action 2: Download Excel (.xlsx) pre-filled */}
            <button
              onClick={handleDownloadXLSX}
              disabled={loading || rows.length === 0 || isExportingExcel}
              className="px-3.5 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs shadow-md shadow-blue-950/40 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Tải ngay file Excel (.xlsx) đã điền sẵn 100% dữ liệu, mở là dùng ngay"
            >
              {isExportingExcel ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tạo Excel...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 text-blue-200" />
                  <span>Tải File Excel (.xlsx)</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOnlyCopyData}
              disabled={loading || rows.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Sao chép bảng dữ liệu đã decor vào bộ nhớ tạm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã Chép!' : 'Chép Bảng'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              disabled={loading || rows.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Tải file CSV tiếng Việt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải CSV</span>
            </button>
          </div>
        </div>

        {/* Visual Paste Guide Banner when Google Sheet is opened */}
        {pasteGuide && (
          <div className="mx-5 mt-3 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-100 text-xs shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <Check className="w-4 h-4" />
                </span>
                <div className="space-y-1.5">
                  <p className="font-bold text-white text-xs sm:text-sm">
                    Đã mở tab Google Sheet &amp; sao chép sẵn bảng dữ liệu vào Clipboard!
                  </p>
                  <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                    Tại trang Google Sheet vừa mở, bạn chỉ cần bấm chuột vào ô <strong className="text-emerald-300 font-bold">A1</strong> và nhấn:
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <kbd className="px-2.5 py-1 rounded-md bg-slate-800 border-2 border-emerald-400/50 text-white font-mono font-bold text-xs shadow-sm">
                      Ctrl + V
                    </kbd>
                    <span className="text-slate-400 text-xs">(hoặc <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-white font-mono text-[11px]">⌘ + V</kbd> trên Mac)</span>
                    <span className="text-emerald-300 font-semibold text-xs">➔ Toàn bộ bảng màu sắc, tiêu đề và danh sách sẽ lập tức hiện ra!</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOnlyCopyData}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer"
                >
                  {copied ? '✓ Đã chép lại' : 'Chép lại'}
                </button>
                <button
                  type="button"
                  onClick={() => setPasteGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Đóng thông báo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

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
              TEAM BUILDING 2026 — CHUNG TAY ĐẨY LÙI HIV/AIDS
            </div>
            <div className="bg-red-800 text-red-100 text-[11px] italic text-center py-1 px-4 border-b border-red-900/50">
              DANH SÁCH TỔNG HỢP VẬN ĐỘNG VIÊN &amp; CÁ NHÂN ĐĂNG KÝ
            </div>

            {/* Data Rows */}
            <div className="overflow-x-auto max-h-[44vh]">
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

          {/* Optional Google Apps Script Helper Accordion */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowAppsScriptGuide((prev) => !prev)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-left text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Bạn muốn hệ thống tự động tạo file lưu thẳng vào Google Drive (không cần bấm Ctrl + V)?</span>
              </span>
              {showAppsScriptGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAppsScriptGuide && (
              <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 space-y-3 text-slate-300">
                <p className="text-[11px] leading-relaxed">
                  Vì lý do bảo mật của Google, trình duyệt ngoài không thể tự ý ghi file vào tài khoản Google của bạn nếu chưa có quyền. Để tạo tự động 100% thẳng vào Google Drive của bạn:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 pl-1">
                  <li>Truy cập <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">script.google.com</a> và bấm <strong>Dự án mới (New project)</strong>.</li>
                  <li>Dán mã sau vào và nhấn <strong>Triển khai (Deploy) ➔ Triển khai dưới dạng ứng dụng web (Web app)</strong>:</li>
                </ol>
                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-emerald-300 font-mono overflow-x-auto select-all">
{`function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.create("TEAM BUILDING 2026 - CHUNG TAY ĐẨY LÙI HIV/AIDS");
  var sheet = ss.getActiveSheet();
  if (data.rows && data.rows.length > 0) {
    sheet.getRange(1, 1, data.rows.length, data.rows[0].length).setValues(data.rows);
  }
  return ContentService.createTextOutput(JSON.stringify({ url: ss.getUrl() })).setMimeType(ContentService.MimeType.JSON);
}`}
                </pre>
                <p className="text-[11px] text-slate-400">
                  3. Chọn quyền truy cập: <strong>Ai cũng có quyền (Anyone)</strong>, sau đó sao chép URL triển khai và thêm vào file <code className="text-purple-300 font-mono">.env</code> biến: <code className="text-amber-300 font-mono">GOOGLE_APPS_SCRIPT_URL=https://script.google.com/.../exec</code>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Khuyên dùng: Bấm <strong>Tải File Excel (.xlsx)</strong> để có ngay file đầy đủ thông tin hoặc <strong>Mở Google Sheet &amp; Dán</strong>.</span>
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
