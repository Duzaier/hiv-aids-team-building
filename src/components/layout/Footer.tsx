'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 sm:mt-16 border-t border-slate-800 bg-slate-950 py-8 px-3 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Medical & Privacy Disclaimer */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs leading-relaxed">
          <strong>Lưu ý:</strong> Hệ thống chỉ ghi nhận danh sách đăng ký để sắp xếp đội thi đấu cho hoạt động team building. Ban tổ chức không thu thập bất kỳ thông tin bệnh án hay dữ liệu y tế cá nhân nào.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 text-center sm:text-left">
          <span className="font-medium text-slate-300">
            Hội Thao & Team Building Truyền Thông HIV/AIDS 2026
          </span>
          <span className="text-slate-500">
            © 2026 Ban Tổ Chức.
          </span>
        </div>
      </div>
    </footer>
  );
};