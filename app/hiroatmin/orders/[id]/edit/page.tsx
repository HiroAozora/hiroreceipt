"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useParams as nextUseParams } from "next/navigation";

export default function AdminEditOrderPage() {
  const router = useRouter();
  const params = nextUseParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [order, setOrder] = useState<any>(null);

  // Form States (Hanya status dan link untuk diedit, harga/nama klien biasanya fixed di sistem receipt awal)
  const [paymentStatus, setPaymentStatus] = useState("Belum Bayar");
  const [progressStatus, setProgressStatus] = useState("Menunggu");
  const [forceShowLink, setForceShowLink] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const [newTimelineDesc, setNewTimelineDesc] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrder({ id: docSnap.id, ...data });

          setPaymentStatus(data.status?.payment || "Belum Bayar");
          setProgressStatus(data.status?.progress || "Menunggu");
          setForceShowLink(data.delivery?.forceShowLink || false);
          setDriveLink(data.delivery?.googleDriveLink || "");
          setAdminNotes(data.adminNotes || "");
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
    fetchOrder();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      setIsSubmitting(true);
      const docRef = doc(db, "orders", order.id);

      const updatePayload: any = {
        "status.payment": paymentStatus,
        "status.progress": progressStatus,
        "delivery.googleDriveLink": driveLink,
        "delivery.forceShowLink": forceShowLink,
        adminNotes: adminNotes,
        "metadata.updatedAt": serverTimestamp(),
      };

      // Add timeline array entry using arrayUnion trick via getDoc first or just manual array clone
      if (newTimelineDesc.trim() !== "") {
        const newEvent = {
          title: `Update: ${progressStatus}`,
          description: newTimelineDesc,
          timestamp: new Date(),
        };
        updatePayload.timeline = [...(order.timeline || []), newEvent];
      }

      await updateDoc(docRef, updatePayload);
      router.push(`/hiroatmin/orders/${order.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Gagal mengupdate order.");
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/hiroatmin/orders/${order.id}`}
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Update Order Status
          </h1>
          <p className="font-mono text-sm text-slate-500 mt-0.5">{order.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <p className="font-semibold text-slate-900">{order.client.name}</p>
            <p className="text-sm text-slate-500">
              {order.orderDetails.serviceName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-600">
              Rp{" "}
              {(
                order.orderDetails.total ??
                order.orderDetails.price ??
                0
              ).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              >
                <option value="Belum Bayar">Belum Bayar</option>
                <option value="DP">DP (Sebagian)</option>
                <option value="Lunas">Lunas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Progress
              </label>
              <select
                value={progressStatus}
                onChange={(e) => setProgressStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              >
                <option value="Menunggu">Menunggu</option>
                <option value="Dikerjakan">Dikerjakan</option>
                <option value="Revisi">Revisi</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <h3 className="font-semibold text-slate-900">Delivery Logic</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Google Drive Link
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-slate-50">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={forceShowLink}
                  onChange={(e) => setForceShowLink(e.target.checked)}
                />
                <div
                  className={clsx(
                    "block w-10 h-6 rounded-full transition-colors",
                    forceShowLink ? "bg-emerald-500" : "bg-slate-300",
                  )}
                ></div>
                <div
                  className={clsx(
                    "dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                    forceShowLink && "translate-x-4",
                  )}
                ></div>
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-900">
                  Force Show Link
                </span>
                <span className="block text-xs text-slate-500">
                  Munculkan paksa tanpa melihat status pembayaran.
                </span>
              </div>
            </label>
          </div>

          {/* Internal Admin Notes */}
          <div className="border-t border-slate-100 pt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              📌 Catatan Internal Admin (Tidak terlihat oleh klien)
            </label>
            <textarea
              rows={3}
              placeholder="Catatan pribadi tentang order ini, konteks pengerjaan, dll."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all resize-none text-sm"
            ></textarea>
            <p className="text-xs text-amber-600 mt-1 font-medium">
              ⚠️ Hanya terlihat di dashboard admin, tidak muncul di invoice atau tracking publik.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tambah Catatan di Timeline Publik (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Bab 1-3 sudah selesai, sedang lanjut bab 4."
              value={newTimelineDesc}
              onChange={(e) => setNewTimelineDesc(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
            ></textarea>
            <p className="text-xs text-slate-500 mt-2">
              Catatan ini akan dilihat oleh pelanggan di halaman tracking.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={18} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
