"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams as nextUseParams } from "next/navigation";

export type OrderItem = {
  name: string;
  addon: string;
  qty: number;
  price: number;
};

export default function EditOrderDetailsPage() {
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

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientWA, setClientWA] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrder({ id: docSnap.id, ...data });

          setClientName(data.client?.name || "");
          setClientWA(data.client?.whatsapp || "");

          if (data.orderDetails?.items && data.orderDetails.items.length > 0) {
            setItems(data.orderDetails.items);
          } else {
            // Fallback for older orders without items array
            setItems([
              {
                name: data.orderDetails?.serviceName || "",
                addon: data.orderDetails?.serviceAddon || "",
                qty: 1,
                price: data.orderDetails?.price || 0,
              },
            ]);
          }
          setDiscount(data.orderDetails?.discount || 0);
        } else {
          alert("Order tidak ditemukan");
          router.push("/admin");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

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
    if (!order) return;

    try {
      setIsSubmitting(true);
      const docRef = doc(db, "orders", order.id);

      await updateDoc(docRef, {
        "client.name": clientName,
        "client.whatsapp": clientWA,
        "orderDetails.items": items.map((item) => ({
          name: item.name,
          addon: item.addon,
          qty: Number(item.qty),
          price: Number(item.price),
        })),
        "orderDetails.discount": Number(discount),
        "orderDetails.subtotal": subtotal,
        "orderDetails.total": total,
        "metadata.updatedAt": serverTimestamp(),
      });

      router.push(`/admin/orders/${order.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Gagal mengupdate detail order.");
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
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/orders/${order.id}`}
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Order Details
          </h1>
          <p className="font-mono text-sm text-slate-500 mt-0.5">{order.id}</p>
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
                <p className="text-xs text-slate-500 mt-2">
                  * Mengubah nomor WA di sini tidak merubah struktur Order ID
                  yang telah terbentuk secara fisik.
                </p>
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
                        Add-on / Tipe Layanan (Ops.)
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

          <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-b-2xl">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 rounded-xl font-bold transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    Simpan Perubahan Detail
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
