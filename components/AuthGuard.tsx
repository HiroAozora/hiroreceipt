"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in -> Redirect to admin login page
        router.push("/admin/login");
      } else if (!isAdmin) {
        // Logged in but not admin -> Redirect to unauthorized or home
        router.push("/unauthorized");
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-950/20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If we have a user and they are an admin, render the protected content
  if (user && isAdmin) {
    return <>{children}</>;
  }

  // While redirecting or if unauthorized (fallback)
  return null;
}
