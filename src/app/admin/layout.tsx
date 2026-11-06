// src/app/admin/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  const role = (session.user as any)?.role;
  const isApproved = (session.user as any)?.isApproved;

  if (role !== "ADMIN" && !(role === "MANAGER" && isApproved)) {
    redirect("/login?error=UnauthorizedAccess");
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground">
      <AdminSidebar user={session.user} />
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto max-w-full">
        {children}
      </main>
    </div>
  );
}
