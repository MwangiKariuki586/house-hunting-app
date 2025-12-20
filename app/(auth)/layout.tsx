// Auth layout - minimal layout for login/register pages
import Link from "next/link";
import { Home } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Simple header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">VerifiedNyumba</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Auth content */}
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}

