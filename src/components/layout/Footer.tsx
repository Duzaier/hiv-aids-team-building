import React from 'react';
import { Heart, ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950/80 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Explicit Medical & Privacy Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
          <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-slate-300">
            <strong>ThÃ´ng bÃ¡o Ã½ nghÄ©a sá»± kiá»‡n & Quyá»n riÃªng tÆ°:</strong> ÄÃ¢y lÃ  hoáº¡t Ä‘á»™ng Team Building vÃ  há»™i thao truyá»n thÃ´ng nÃ¢ng cao nháº­n thá»©c cá»™ng Ä‘á»“ng vá» phÃ²ng chá»‘ng HIV/AIDS. Ná»n táº£ng chá»‰ ghi nháº­n thÃ´ng tin phá»¥c vá»¥ phÃ¢n bá»• trÃ² chÆ¡i Ä‘á»™i nhÃ³m, tuyá»‡t Ä‘á»‘i khÃ´ng thu tháº­p, suy diá»…n hay liÃªn quan tá»›i báº¥t ká»³ thÃ´ng tin bá»‡nh Ã¡n hoáº·c tÃ¬nh tráº¡ng y táº¿ cÃ¡ nhÃ¢n nÃ o.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/60 text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ná»n táº£ng kiá»ƒm soÃ¡t cháº·t cháº½ 6 Slot giao dá»‹ch Ä‘á»™c láº­p.</span>
          </div>

          <p className="flex items-center gap-1 justify-center">
            Thiáº¿t káº¿ & Váº­n hÃ nh vÃ¬ má»¥c Ä‘Ã­ch lan tá»a yÃªu thÆ°Æ¡ng
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            Â© 2026.
          </p>
        </div>
      </div>
    </footer>
  );
};
