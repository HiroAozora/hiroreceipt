"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface OrderData {
  id: string;
  client: { name: string; whatsapp: string };
  orderDetails: {
    items?: { name: string; qty: number; price: number }[];
    total?: number;
    price?: number;
    serviceName?: string;
  };
  status: { payment: string; progress: string };
  metadata: { createdAt: any };
}

export default function FinancePage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          orderBy("metadata.createdAt", "desc"),
        );
        const snap = await getDocs(q);
        const data: OrderData[] = [];
        snap.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as OrderData));
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const stats = useMemo(() => {
    const lunas = orders.filter((o) => o.status.payment === "Lunas");
    const dp = orders.filter((o) => o.status.payment === "DP");
    const belum = orders.filter((o) => o.status.payment === "Belum Bayar");

    const sum = (arr: OrderData[]) =>
      arr.reduce((acc, o) => acc + (o.orderDetails.total ?? o.orderDetails.price ?? 0), 0);

    return {
      total: sum(orders),
      collected: sum(lunas),
      dp: sum(dp),
      pending: sum(belum),
      countLunas: lunas.length,
      countDP: dp.length,
      countBelum: belum.length,
    };
  }, [orders]);

  const getOrderValue = (o: OrderData) =>
    o.orderDetails.total ?? o.orderDetails.price ?? 0;

  const getServiceName = (o: OrderData) => {
    if (o.orderDetails.items?.length) {
      const first = o.orderDetails.items[0].name;
      return o.orderDetails.items.length > 1
        ? `${first} (+${o.orderDetails.items.length - 1})`
        : first;
    }
    return o.orderDetails.serviceName || "-";
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/hiroatmin"
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance</h1>
          <p className="text-sm text-slate-500">Ringkasan keuangan dari seluruh order</p>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Collected */}
        <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-emerald-200" />
              <span className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Lunas</span>
            </div>
            <p className="text-2xl font-bold">
              {loading ? "-" : `Rp ${stats.collected.toLocaleString("id-ID")}`}
            </p>
            <p className="text-emerald-200 text-xs mt-1">{stats.countLunas} order terbayar</p>
          </div>
        </div>

        {/* DP */}
        <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-blue-200" />
              <span className="text-blue-100 text-sm font-medium uppercase tracking-wide">DP / Sebagian</span>
            </div>
            <p className="text-2xl font-bold">
              {loading ? "-" : `Rp ${stats.dp.toLocaleString("id-ID")}`}
            </p>
            <p className="text-blue-200 text-xs mt-1">{stats.countDP} order belum lunas</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-red-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-red-400" />
              <span className="text-red-500 text-sm font-medium uppercase tracking-wide">Belum Bayar</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {loading ? "-" : `Rp ${stats.pending.toLocaleString("id-ID")}`}
            </p>
            <p className="text-red-400 text-xs mt-1">{stats.countBelum} order belum dibayar</p>
          </div>
        </div>
      </div>

      {/* Total Revenue Bar */}
      {!loading && stats.total > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-slate-500" />
              <h2 className="font-bold text-slate-900">Total Revenue Keseluruhan</h2>
            </div>
            <span className="text-xl font-bold text-slate-900">
              Rp {stats.total.toLocaleString("id-ID")}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${(stats.collected / stats.total) * 100}%` }}
            />
            <div
              className="h-full bg-blue-400 transition-all"
              style={{ width: `${(stats.dp / stats.total) * 100}%` }}
            />
            <div
              className="h-full bg-red-300 transition-all"
              style={{ width: `${(stats.pending / stats.total) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Lunas ({Math.round((stats.collected / stats.total) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
              DP ({Math.round((stats.dp / stats.total) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-300 inline-block" />
              Belum Bayar ({Math.round((stats.pending / stats.total) * 100)}%)
            </span>
          </div>
        </div>
      )}

      {/* Unpaid / Pending Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <TrendingUp size={18} className="text-red-500" />
          <h2 className="font-bold text-slate-900">Order Belum Lunas</h2>
          <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
            {stats.countBelum + stats.countDP} order
          </span>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.filter((o) => o.status.payment !== "Lunas").length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            🎉 Semua order sudah lunas!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Layanan</th>
                  <th className="px-6 py-3 font-medium">Status Bayar</th>
                  <th className="px-6 py-3 font-medium text-right">Tagihan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders
                  .filter((o) => o.status.payment !== "Lunas")
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/hiroatmin/orders/${order.id}`}
                          className="font-mono font-medium text-blue-600 hover:underline"
                        >
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{order.client.name}</div>
                        <div className="text-xs text-slate-500">{order.client.whatsapp}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[180px] truncate">{getServiceName(order)}</td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
                          order.status.payment === "DP"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700",
                        )}>
                          {order.status.payment}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        Rp {getOrderValue(order).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
