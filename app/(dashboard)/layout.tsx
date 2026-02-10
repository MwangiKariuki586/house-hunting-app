// Dashboard layout for authenticated users
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Header } from "@/app/components/layout/Header";
import { getCurrentUser } from "@/app/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    const headersList = await headers();
    const pathname = headersList.get("x-invoke-path") || "";
    const redirectUrl = pathname ? `/login?callbackUrl=${encodeURIComponent(pathname)}` : "/login";
    redirect(redirectUrl);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header user={user} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}



