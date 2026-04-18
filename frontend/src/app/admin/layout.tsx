import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminGuard from "@/components/auth/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-950">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto max-h-screen no-scrollbar relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8734A]/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
          
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
