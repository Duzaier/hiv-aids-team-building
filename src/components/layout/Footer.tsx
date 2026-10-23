'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 sm:mt-16 border-t border-slate-800 bg-slate-950 py-8 px-3 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Medical & Privacy Disclaimer */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs leading-relaxed">
          <strong>Thông báo sự kiện & Quyền riêng tư:</strong> Đây là hoạt động Team Building và hội thao truyền thông nâng cao nhận thức cộng đồng về phòng chống HIV/AIDS. Nền tảng chỉ ghi nhận thông tin phân bổ trò chơi đội nhóm, tuyệt đối không thu thập hoặc liên quan tới bất kỳ thông tin bệnh án hay tình trạng y tế cá nhân nào.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 text-center sm:text-left">
          <span className="font-medium text-slate-300">
            Chung tay đẩy lùi HIV/AIDS — Lan tỏa yêu thương & xóa nhòa định kiến.
          </span>
          <span className="text-slate-500">
            Sự kiện Team Building Vì Cộng Đồng © 2026.
          </span>
        </div>
      </div>
    </footer>
  );
};