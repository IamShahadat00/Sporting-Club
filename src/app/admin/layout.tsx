// src/app/admin/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Verify session on the server
  const session = await auth();

  // If there is no user session, FORCE redirect to /login
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  const role = (session.user as any)?.role;
  const isApproved = (session.user as any)?.isApproved;

  // 2. Role-based verification:
  // - ADMIN has full access
  // - MANAGER must be approved by the admin
  // - Others are blocked
  if (role !== "ADMIN" && !(role === "MANAGER" && isApproved)) {
    redirect("/login?error=UnauthorizedAccess");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar user={session.user} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
