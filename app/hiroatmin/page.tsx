"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  PackageSearch,
  Activity,
  TrendingUp,
  KeySquare,
  ChevronRight,
  Wallet,
  Search,
  Filter,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import clsx from "clsx";

interface OrderData {
  id: string;
  client: { name: string; whatsapp: string };
  orderDetails: {
    items?: { name: string; addon?: string; qty: number; price: number }[];
    total?: number;
    subtotal?: number;
    serviceName?: string;
    price?: number;
  };
  status: { payment: string; progress: string };
  metadata: { createdAt: any };
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("Semua");
  const [progressFilter, setProgressFilter] = useState("Semua");

  const stats = useMemo(() => {
    const totalOrders = allOrders.length;
    const inProgress = allOrders.filter(
      (o) =>
        o.status.progress === "Dikerjakan" || o.status.progress === "Revisi",
    ).length;
    const awaitingPayment = allOrders.filter(
      (o) =>
        o.status.payment === "Belum Bayar" || o.status.payment === "DP",
    ).length;
    const collectedRevenue = allOrders
      .filter((o) => o.status.payment === "Lunas")
      .reduce((acc, o) => acc + (o.orderDetails.total ?? o.orderDetails.price ?? 0), 0);
    const pendingRevenue = allOrders
      .filter((o) => o.status.payment !== "Lunas")
      .reduce((acc, o) => acc + (o.orderDetails.total ?? o.orderDetails.price ?? 0), 0);
    return { totalOrders, inProgress, awaitingPayment, collectedRevenue, pendingRevenue };
  }, [allOrders]);

  const filteredOrders = useMemo(() => {
    let result = allOrders;
    if (paymentFilter !== "Semua") {
      result = result.filter((o) => o.status.payment === paymentFilter);
    }
    if (progressFilter !== "Semua") {
      result = result.filter((o) => o.status.progress === progressFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.client.name.toLowerCase().includes(q) ||
          o.client.whatsapp.includes(q),
      );
    }
    return result;
  }, [allOrders, paymentFilter, progressFilter, searchQuery]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "orders"),
          orderBy("metadata.createdAt", "desc"),
        );
        const snapshot = await getDocs(q);
        const fetchedOrders: OrderData[] = [];
        snapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as OrderData);
        });
        setAllOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Helper: clicking a stat card sets the filter
  const handleStatCardClick = (pFilter: string, prFilter: string) => {
    setPaymentFilter(pFilter);
    setProgressFilter(prFilter);
    setSearchQuery("");
    // scroll to table
    document.getElementById("orders-table")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.displayName}. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/hiroatmin/finance"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
          >
            <BarChart3 size={16} />
            Finance
          </Link>
          <Link
            href="/hiroatmin/orders/new"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-slate-900/20 active:scale-95"
          >
            <Plus size={18} />
            New Order
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <button
          onClick={() => handleStatCardClick("Semua", "Semua")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group text-left hover:border-emerald-300 hover:shadow-md transition-all"
        >
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 bg-emerald-50 rounded-full transition-transform group-hover:scale-150 duration-500" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <PackageSearch size={20} />
            </div>
            <h3 className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wide">Total Orders</h3>
            <span className="text-3xl font-bold text-slate-900">{loading ? "-" : stats.totalOrders}</span>
          </div>
        </button>

        {/* In Progress */}
        <button
          onClick={() => handleStatCardClick("Semua", "Dikerjakan")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group text-left hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 bg-blue-50 rounded-full transition-transform group-hover:scale-150 duration-500" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Activity size={20} />
            </div>
            <h3 className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wide">In Progress</h3>
            <span className="text-3xl font-bold text-slate-900">{loading ? "-" : stats.inProgress}</span>
          </div>
        </button>

        {/* Awaiting Payment */}
        <button
          onClick={() => handleStatCardClick("Belum Bayar", "Semua")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group text-left hover:border-red-300 hover:shadow-md transition-all"
        >
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 bg-red-50 rounded-full transition-transform group-hover:scale-150 duration-500" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center mb-3">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wide">Awaiting Payment</h3>
            <span className="text-3xl font-bold text-slate-900">{loading ? "-" : stats.awaitingPayment}</span>
          </div>
        </button>

        {/* Revenue Split */}
        <Link
          href="/hiroatmin/finance"
          className="bg-emerald-600 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:bg-emerald-700 transition-all block"
        >
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 bg-white/10 rounded-full transition-transform group-hover:scale-150 duration-500" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center mb-3">
              <Wallet size={20} />
            </div>
            <h3 className="text-emerald-100 font-medium text-xs mb-1 uppercase tracking-wide">Collected</h3>
            <p className="text-lg font-bold text-white leading-tight">
              {loading ? "-" : `Rp ${stats.collectedRevenue.toLocaleString("id-ID")}`}
            </p>
            <p className="text-emerald-200 text-xs mt-1">
              +{loading ? "-" : `Rp ${stats.pendingRevenue.toLocaleString("id-ID")}`} pending
            </p>
          </div>
        </Link>
      </div>

      {/* Orders Table */}
      <div id="orders-table" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">All Orders</h2>
            {(paymentFilter !== "Semua" || progressFilter !== "Semua" || searchQuery) && (
              <button
                onClick={() => { setPaymentFilter("Semua"); setProgressFilter("Semua"); setSearchQuery(""); }}
                className="text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors"
              >
                Reset filter
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, WA, atau ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 outline-none w-full sm:w-52"
              />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-400 outline-none bg-white appearance-none w-full sm:w-36"
              >
                <option value="Semua">Semua</option>
                <option value="Lunas">Lunas</option>
                <option value="DP">DP</option>
                <option value="Belum Bayar">Belum Bayar</option>
              </select>
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-400 outline-none bg-white appearance-none w-full sm:w-36"
              >
                <option value="Semua">Semua Progress</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Dikerjakan">Dikerjakan</option>
                <option value="Revisi">Revisi</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center flex justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center text-slate-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <PackageSearch className="text-slate-400" size={28} />
            </div>
            <p>{searchQuery || paymentFilter !== "Semua" || progressFilter !== "Semua"
              ? "Tidak ada order yang cocok dengan filter."
              : "Belum ada pesanan yang masuk."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <KeySquare size={16} className="text-emerald-500" />
                        <span className="font-mono font-medium text-slate-900">{order.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{order.client.name}</div>
                      <div className="text-xs text-slate-500">{order.client.whatsapp}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium truncate max-w-[200px]">
                        {order.orderDetails.items?.length
                          ? `${order.orderDetails.items[0].name}${order.orderDetails.items.length > 1 ? ` (+${order.orderDetails.items.length - 1})` : ""}`
                          : order.orderDetails.serviceName || "-"}
                      </div>
                      <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                        Rp {(order.orderDetails.total ?? order.orderDetails.price ?? 0).toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={clsx(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit",
                          order.status.payment === "Lunas" ? "bg-emerald-100 text-emerald-700"
                          : order.status.payment === "DP" ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                        )}>
                          Bayar: {order.status.payment}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 w-fit">
                          {order.status.progress}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/hiroatmin/orders/${order.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && allOrders.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
            Menampilkan {filteredOrders.length} dari {allOrders.length} order
          </div>
        )}
      </div>
    </div>
  );
}
