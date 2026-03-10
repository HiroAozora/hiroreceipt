"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { StatusBadge } from "@/components/StatusBadge";
import { Invoice } from "@/components/Invoice";
import { Printer, ArrowLeft, Trash2, Edit, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useParams as nextUseParams } from "next/navigation";
import clsx from "clsx";

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = nextUseParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const docRef = doc(db, "orders", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("Order tidak ditemukan");
        router.push("/hiroatmin");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/track/${order.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      // Dynamic import to avoid SSR issues
      const { toJpeg } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const dataUrl = await toJpeg(element, {
        quality: 0.88,
        pixelRatio: 1.5,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${order.id}.pdf`);
    } catch (err) {
      console.error("Gagal men-download PDF", err);
      alert("Terjadi kesalahan saat membuat file PDF. Coba kembali.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus order ini secara permanen?")) return;
    try {
      await deleteDoc(doc(db, "orders", id));
      router.push("/hiroatmin");
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/hiroatmin"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Order Details
            </h1>
            <p className="font-mono text-sm text-slate-500 mt-0.5">
              {order.id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-end mt-4 md:mt-0">
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors"
          >
            <Trash2 size={16} />
            Hapus
          </button>

          <Link
            href={`/hiroatmin/orders/${order.id}/edit-details`}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Edit size={16} />
            Edit Details
          </Link>

          <Link
            href={`/hiroatmin/orders/${order.id}/edit`}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Edit size={16} />
            Edit Status
          </Link>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Download PDF
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            <Printer size={18} />
            Cetak
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Info Summary (Hidden in Print) */}
        <div className="md:col-span-1 space-y-6 print:hidden">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              Status & Tracking
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">
                  Payment
                </p>
                <StatusBadge type="payment" status={order.status.payment} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">
                  Progress
                </p>
                <StatusBadge type="progress" status={order.status.progress} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">
                  Public Tracking Link
                </p>
                <a
                  href={`/track/${order.id}`}
                  target="_blank"
                  className="text-sm font-medium text-blue-600 hover:underline break-all"
                >
                  {typeof window !== "undefined" ? window.location.origin : ""}/track/{order.id}
                </a>
                <button
                  onClick={handleCopyLink}
                  className={clsx(
                    "mt-2 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                    copied
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600",
                  )}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              Delivery Result
            </h3>
            {order.delivery?.googleDriveLink ? (
              <div className="space-y-3">
                <a
                  href={order.delivery.googleDriveLink}
                  target="_blank"
                  className="text-sm font-medium text-blue-600 hover:underline break-all"
                >
                  {order.delivery.googleDriveLink}
                </a>
                <div className="text-xs p-2 rounded bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <span className="font-medium">Force Show:</span>
                  <span
                    className={
                      order.delivery.forceShowLink
                        ? "text-emerald-600 font-bold"
                        : "text-slate-400"
                    }
                  >
                    {order.delivery.forceShowLink ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">
                Belum ada link hasil.
              </p>
            )}
          </div>

          {/* Admin Notes (private) */}
          {order.adminNotes && (
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-amber-800 mb-2 text-sm flex items-center gap-1.5">
                📌 Catatan Internal
              </h3>
              <p className="text-sm text-amber-700 whitespace-pre-wrap">
                {order.adminNotes}
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Invoice Preview (Will be the ONLY visible part in @media print) */}
        <div className="md:col-span-2">
          {/* Printable Wrapper */}
          <div
            id="printable-area"
            className="bg-slate-200/50 p-2 sm:p-8 rounded-3xl print:p-0 print:bg-transparent"
          >
            <Invoice ref={printRef} order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}
