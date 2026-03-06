"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed) return;
    router.push(`/track/${trimmed}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center mb-5 overflow-hidden">
            <Image
              src="/hiroreceipt.svg"
              alt="HiroReceipt Logo"
              width={56}
              height={56}
              priority
            />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            HiroReceipt
          </h1>
          <p className="text-slate-500 text-sm mt-1 text-center">
            Lacak status pesanan kamu secara real-time
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600"></div>

          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Cek Nomor Resi
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Masukkan nomor resi yang kamu terima dari joki.
          </p>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label
                htmlFor="orderId"
                className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
              >
                Nomor Resi / Order ID
              </label>
              <input
                id="orderId"
                type="text"
                placeholder="Contoh: 01-HIR-9870-01"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-mono text-slate-900 placeholder:text-slate-300 placeholder:font-sans text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Lacak Pesanan
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Nomor resi dikirimkan oleh joki setelah pesanan dibuat.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          © {new Date().getFullYear()} HiroReceipt. All rights reserved.
        </p>
      </div>
    </div>
  );
}
