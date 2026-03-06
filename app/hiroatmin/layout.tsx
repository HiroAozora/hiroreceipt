"use client";

import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, LogOut, Menu, X, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If we are exactly on the login page, don't show the dashboard layout
  if (pathname === "/hiroatmin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Dashboard", href: "/hiroatmin", icon: LayoutDashboard },
    { name: "New Order", href: "/hiroatmin/orders/new", icon: Plus },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 flex flex-col",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Logo Area */}
          <div className="h-20 flex items-center px-8 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mr-3 overflow-hidden">
              <Image
                src="/hiroreceipt.svg"
                alt="HiroReceipt"
                width={32}
                height={32}
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              HiroReceipt
            </span>
            <button
              className="ml-auto lg:hidden text-slate-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-8 space-y-2">
            <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Menu Utama
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                    isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <Icon
                    size={20}
                    className={isActive ? "text-emerald-500" : "text-slate-400"}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2 flex items-center gap-3">
              <img
                src={
                  user?.photoURL ||
                  "https://ui-avatars.com/api/?name=Admin&background=random"
                }
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.displayName || "Admin"}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 justify-center py-3 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all">
          {/* Topbar for mobile */}
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:hidden sticky top-0 z-30">
            <div className="flex items-center gap-3">
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
            <button
              className="p-2 -mr-2 text-slate-600 rounded-lg hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
