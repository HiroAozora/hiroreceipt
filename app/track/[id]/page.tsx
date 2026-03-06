"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline } from "@/components/Timeline";
import { DeliveryBox } from "@/components/DeliveryBox";
import { Invoice } from "@/components/Invoice";
import { Receipt, Search, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams as nextUseParams } from "next/navigation";

export default function TrackingPage() {
  const params = nextUseParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      setDownloading(true);
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const dataUrl = await toPng(element, { quality: 0.98, pixelRatio: 2 });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${order.id}.pdf`);
    } catch (err) {
      console.error("Gagal men-download PDF", err);
      alert("Terjadi kesalahan saat membuat file PDF.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Order tidak ditemukan. Periksa kembali ID Resi Anda.");
        }
      } catch (err) {
        console.error("Error fetching tracking data:", err);
        setError("Terjadi kesalahan saat memuat data. Coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">
            Memuat Tracking...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Tidak Ditemukan
          </h1>
          <p className="text-slate-500 mb-8">{error}</p>
          <Link
            href="/"
            className="inline-flex justify-center w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Derive Progress Description internally (or store it in DB). For now, static map based on progress status.
  const getProgressDesc = (status: string) => {
    switch (status) {
      case "Menunggu":
        return "Materi diterima, saat ini joki sedang menjadwalkan pengerjaan. Mohon ditunggu.";
      case "Dikerjakan":
        return "Joki sedang mengeksekusi tugas Anda. Anda bisa memantau update terbaru lewat sini.";
      case "Revisi":
        return "Sedang dilakukan penyesuaian/revisi berdasarkan feedback yang diberikan.";
      case "Selesai":
        return "Pekerjaan telah selesai sepenuhnya. Silakan cek hasil di kotak pengiriman.";
      default:
        return "Memproses...";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Public Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
              <Image
                src="/hiroreceipt.svg"
                alt="HiroReceipt"
                width={24}
                height={24}
              />
            </div>
            <span className="font-bold text-lg text-slate-900">
              HiroReceipt
            </span>
          </div>
          <div className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full tracking-wider">
            LIVE TRACKING
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Receipt Header Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600"></div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <p className="text-slate-500 font-medium mb-1 text-sm uppercase tracking-wider">
                Nomor Resi
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 font-mono tracking-tight mb-4">
                {order.id}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge type="progress" status={order.status.progress} />
                <StatusBadge type="payment" status={order.status.payment} />
              </div>

              <div className="mt-6 md:mt-8">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-70"
                >
                  {downloading ? (
                    <div className="w-4 h-4 border-2 border-slate-50 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Download size={16} />
                  )}
                  {order.status.payment === "Lunas"
                    ? "Download Receipt"
                    : "Download Invoice"}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-w-[240px]">
              <div className="mb-4">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                  Klien
                </p>
                <p className="font-semibold text-slate-800">
                  {order.client.name}
                </p>
                <p className="text-sm text-slate-500 select-all">
                  {order.client.whatsapp}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                  Layanan
                </p>
                <p className="font-semibold text-slate-800">
                  {order.orderDetails.items?.length
                    ? `${order.orderDetails.items[0].name} ${order.orderDetails.items.length > 1 ? `(+${order.orderDetails.items.length - 1})` : ""}`
                    : order.orderDetails.serviceName}
                </p>
                <p className="text-sm text-emerald-600 font-bold mt-0.5">
                  Rp{" "}
                  {(
                    order.orderDetails.total ??
                    order.orderDetails.price ??
                    0
                  ).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Box (Conditional Renderer inside) */}
        {order.delivery?.googleDriveLink && (
          <DeliveryBox
            paymentStatus={order.status.payment}
            forceShowLink={order.delivery.forceShowLink}
            googleDriveLink={order.delivery.googleDriveLink}
          />
        )}

        {/* Timeline Section */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">
            Progress Tracking
          </h2>

          <div className="px-2 md:px-0">
            <Timeline
              events={order.timeline || []}
              currentProgressDesc={getProgressDesc(order.status.progress)}
            />
          </div>
        </div>
      </main>

      {/* Off-screen Invoice for html-to-image */}
      <div className="absolute left-[9999px] top-0 overflow-hidden pointer-events-none opacity-0">
        <div ref={printRef} className="w-[800px] bg-white">
          <Invoice order={order} />
        </div>
      </div>
    </div>
  );
}
