import { ExternalLink, LockKeyhole, CheckCircle } from "lucide-react";

interface DeliveryBoxProps {
  paymentStatus: string;
  forceShowLink: boolean;
  googleDriveLink?: string;
}

export function DeliveryBox({
  paymentStatus,
  forceShowLink,
  googleDriveLink,
}: DeliveryBoxProps) {
  const isLinkVisible =
    forceShowLink || paymentStatus === "Lunas" || paymentStatus === "DP";

  if (!googleDriveLink) return null; // If admin hasn't filled the link at all

  if (isLinkVisible) {
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              <CheckCircle size={20} className="text-emerald-50" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Hasil Pekerjaan</h3>
              <p className="text-emerald-100 text-sm">Akses diberikan</p>
            </div>
          </div>

          <a
            href={googleDriveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm px-4 py-3 rounded-xl transition-all"
          >
            <span className="font-medium truncate mr-4 text-emerald-50">
              Buka Google Drive
            </span>
            <ExternalLink size={18} className="text-emerald-200 shrink-0" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-900/10 text-white relative overflow-hidden">
      <div className="relative z-10 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
          <LockKeyhole size={20} className="text-slate-300" />
        </div>
        <h3 className="font-bold text-lg mb-1">Akses Terkunci</h3>
        <p className="text-slate-400 text-sm mb-4">
          Lunaasi pembayaran atau DP untuk membuka link Google Drive hasil
          pekerjaan.
        </p>
        <div className="w-full bg-slate-700/50 border border-slate-600/50 px-4 py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
          <LockKeyhole size={16} className="text-slate-500" />
          <span className="font-medium text-slate-500">Link Hidden</span>
        </div>
      </div>
    </div>
  );
}
