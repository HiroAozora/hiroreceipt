"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  runTransaction,
  query,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export type OrderItem = {
  name: string;
  addon: string;
  qty: number;
  price: number;
};

export default function NewOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientWA, setClientWA] = useState("");

  const [items, setItems] = useState<OrderItem[]>([
    { name: "", addon: "", qty: 1, price: 0 },
  ]);
  const [discount, setDiscount] = useState<number>(0);

  const [paymentStatus, setPaymentStatus] = useState("Belum Bayar");
  const [progressStatus, setProgressStatus] = useState("Menunggu");
  const [forceShowLink, setForceShowLink] = useState(false);
  const [driveLink, setDriveLink] = useState("");

  const subtotal = items.reduce(
    (acc, curr) => acc + Number(curr.price || 0) * Number(curr.qty || 1),
    0,
  );
  const total = Math.max(0, subtotal - Number(discount || 0));

  const handleAddItem = () => {
    setItems([...items, { name: "", addon: "", qty: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const newId = await generateCustomOrderId(clientName, clientWA);
      const orderRef = doc(db, "orders", newId);
      await setDoc(orderRef, {
        client: {
          name: clientName,
          whatsapp: clientWA,
        },
        orderDetails: {
          items: items.map((item) => ({
            name: item.name,
            addon: item.addon,
            qty: Number(item.qty),
            price: Number(item.price),
          })),
          discount: Number(discount),
          subtotal,
          total,
        },
        status: {
          payment: paymentStatus,
          progress: progressStatus,
        },
        delivery: {
          googleDriveLink: driveLink,
          forceShowLink,
        },
        timeline: [
          {
            title: "Pesanan Dibuat",
            description: `Pesanan dibuat pada ${new Date().toLocaleDateString("id-ID")}`,
            timestamp: new Date(),
          },
        ],
        metadata: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user?.email,
        },
      });

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Terjadi kesalahan saat menyimpan pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to handle Custom ID generation
  const generateCustomOrderId = async (name: string, wa: string) => {
    return await runTransaction(db, async (transaction) => {
      // 1. Prepare References
      const counterRef = doc(db, "system", "counters");
      const waClean = wa.replace(/\D/g, "");
      const clientCounterRef = doc(db, "client_counters", waClean || "unknown");

      // 2. Execute ALL Reads First (Firestore requirement)
      const counterDoc = await transaction.get(counterRef);
      const clientDoc = await transaction.get(clientCounterRef);

      // 3. Process Global Counter Write
      let globalCount = 1;
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { globalOrderCount: 1 });
      } else {
        globalCount = (counterDoc.data().globalOrderCount || 0) + 1;
        transaction.update(counterRef, { globalOrderCount: globalCount });
      }

      // 4. Process Client Counter Write
      let clientOrderCount = 1;
      if (!clientDoc.exists()) {
        transaction.set(clientCounterRef, { count: 1, name: name });
      } else {
        clientOrderCount = (clientDoc.data().count || 0) + 1;
        transaction.update(clientCounterRef, {
          count: clientOrderCount,
          name: name,
        });
      }

      // 5. Format ID Components
      const globalStr = globalCount.toString().padStart(2, "0");
      const nameStr = name
        .replace(/[^a-zA-Z]/g, "")
        .padEnd(3, "X")
        .substring(0, 3)
        .toUpperCase();
      const waStr = waClean.slice(-4).padStart(4, "0");
      const clientOrderStr = clientOrderCount.toString().padStart(2, "0");

      // Combine: [Urutan Global]-[3 Huruf Nama Klien]-[4 Digit WA Terakhir]-[Urutan Klien]
      return `${globalStr}-${nameStr}-${waStr}-${clientOrderStr}`;
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create New Order
          </h1>
          <p className="text-sm text-slate-500">
            Fill details to generate ID and create a new tracking ticket.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
          {/* Section: Client & Service */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                Client Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Klien
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Hiro Aozora"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. 081234569870"
                  value={clientWA}
                  onChange={(e) => setClientWA(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Service Details
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wide"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative group"
                >
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Nama Layanan / Tugas
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. Joki Makalah"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Add-on / Tipe Layanan (Ops. untuk ditaruh di bawahnya)
                      </label>
                      <input
                        type="text"
                        placeholder="E.g. Fast Track Express"
                        value={item.addon}
                        onChange={(e) =>
                          updateItem(index, "addon", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(index, "qty", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Harga Satuan (Rp)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                          Rp
                        </span>
                        <input
                          type="number"
                          required
                          placeholder="50000"
                          value={item.price || ""}
                          onChange={(e) =>
                            updateItem(index, "price", e.target.value)
                          }
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-100 flex flex-col items-end gap-3 text-sm">
                <div className="flex items-center gap-4 w-full md:w-2/3">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="flex-1 text-right font-semibold text-slate-800">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex items-center gap-4 w-full md:w-2/3">
                  <span className="text-slate-500 font-medium">Discount</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                      Rp
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={discount || ""}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none transition-all text-right text-red-500 font-medium placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-2/3 pt-3 border-t border-slate-200">
                  <span className="text-slate-900 font-bold text-lg">
                    Total
                  </span>
                  <span className="text-emerald-600 font-bold text-lg">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Status & Delivery */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">
                Status & Tracking
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
                  >
                    <option value="Belum Bayar">Belum Bayar</option>
                    <option value="DP">DP (Sebagian)</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Progress
                  </label>
                  <select
                    value={progressStatus}
                    onChange={(e) => setProgressStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Dikerjakan">Dikerjakan</option>
                    <option value="Revisi">Revisi</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">
                Delivery Logic
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Google Drive Link
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400 bg-white"
                />
                <p className="text-xs text-slate-500 mt-2">
                  * Otomatis muncul ke publik JIKA status pembayaran adalah{" "}
                  <strong>Lunas</strong> atau <strong>DP</strong>.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-colors">
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
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      Force Show Link to Customer
                    </span>
                    <span className="text-xs text-slate-500">
                      Abaikan aturan bayar, munculkan paksa.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section: Generate ID & Submit */}
          <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-b-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full text-center md:text-left">
                <p className="text-sm font-medium text-emerald-400 mb-1">
                  Resi / Invoice otomatis diterbitkan pada saat disave
                </p>
                <p className="text-xs text-slate-400">
                  Data order dari WA yang sama akan terekam ke dalam counter
                  khusus klien tersebut secara akurat.
                </p>
              </div>

              <div className="w-full md:w-auto md:border-l md:border-slate-700 md:pl-8 flex flex-col items-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 rounded-xl font-bold transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Order & Generate ID
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
