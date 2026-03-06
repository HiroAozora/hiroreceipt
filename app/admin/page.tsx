"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  PackageSearch,
  Activity,
  TrendingUp,
  KeySquare,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import clsx from "clsx";

interface OrderData {
  id: string;
  client: { name: string; whatsapp: string };
  orderDetails: {
    items?: { name: string; addon?: string; qty: number; price: number }[];
    total?: number;
    // Fallback for old orders
    serviceName?: string;
    price?: number;
  };
  status: { payment: string; progress: string };
  metadata: { createdAt: any };
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    active: 0,
    inProgress: 0,
    awaitingPayment: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "orders"),
          orderBy("metadata.createdAt", "desc"),
          limit(10),
        );
        const snapshot = await getDocs(q);

        const fetchedOrders: OrderData[] = [];
        let active = 0;
        let inProgress = 0;
        let awaitingPayment = 0;

        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<OrderData, "id">;
          fetchedOrders.push({ id: doc.id, ...data });

          // Simple logic for stats
          active++;
          if (
            data.status.progress === "Dikerjakan" ||
            data.status.progress === "Revisi"
          ) {
            inProgress++;
          }
          if (
            data.status.payment === "Belum Bayar" ||
            data.status.payment === "DP"
          ) {
            awaitingPayment++;
          }
        });

        setOrders(fetchedOrders);
        setStats({ active, inProgress, awaitingPayment });
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.displayName}. Here's what's happening today.
          </p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-slate-900/20 active:scale-95"
        >
          <Plus size={18} />
          <span>New Order</span>
        </Link>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-50 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <PackageSearch size={24} />
            </div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">
              Active Orders
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {loading ? "-" : stats.active}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-50 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Activity size={24} />
            </div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">
              In Progress
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {loading ? "-" : stats.inProgress}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-purple-50 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">
              Awaiting Payment
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {loading ? "-" : stats.awaitingPayment}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
          <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            View All
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center flex justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <PackageSearch className="text-slate-400" size={28} />
            </div>
            <p>Belum ada pesanan yang masuk.</p>
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
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <KeySquare size={16} className="text-emerald-500" />
                        <span className="font-mono font-medium text-slate-900">
                          {order.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {order.client.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.client.whatsapp}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium truncate max-w-[200px]">
                        {order.orderDetails.items &&
                        order.orderDetails.items.length > 0
                          ? `${order.orderDetails.items[0].name} ${order.orderDetails.items.length > 1 ? `(+${order.orderDetails.items.length - 1})` : ""}`
                          : order.orderDetails.serviceName || "-"}
                      </div>
                      <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                        Rp{" "}
                        {(
                          order.orderDetails.total ??
                          order.orderDetails.price ??
                          0
                        ).toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={clsx(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit",
                            order.status.payment === "Lunas"
                              ? "bg-emerald-100 text-emerald-700"
                              : order.status.payment === "DP"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700",
                          )}
                        >
                          Bayar: {order.status.payment}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 w-fit">
                          {order.status.progress}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
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
      </div>
    </div>
  );
}
