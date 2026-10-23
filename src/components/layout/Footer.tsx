'use client';

import React from 'react';
import { Heart, ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 sm:mt-20 border-t border-slate-800 bg-slate-950/80 py-8 sm:py-10 px-3 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Explicit Medical & Privacy Disclaimer */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 sm:gap-3">
          <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-slate-300 text-xs">
            <strong>Thông báo ý nghĩa sự kiện & Quyền riêng tư:</strong> Đây là hoạt động Team Building và hội thao truyền thông nâng cao nhận thức cộng đồng về phòng chống HIV/AIDS. Nền tảng chỉ ghi nhận thông tin phục vụ phân bổ trò chơi đội nhóm, tuyệt đối không thu thập, suy diễn hay liên quan tới bất kỳ thông tin bệnh án hoặc tình trạng y tế cá nhân nào.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-slate-400 text-center sm:text-left text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Nền tảng kiểm soát chặt chẽ 6 Slot giao dịch độc lập.</span>
          </div>

          <p className="flex items-center gap-1 justify-center">
            Thiết kế & Vận hành vì mục đích lan tỏa yêu thương
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
            © 2026.
          </p>
        </div>
      </div>
    </footer>
  );
};
