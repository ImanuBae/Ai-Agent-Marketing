"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E8734A] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
