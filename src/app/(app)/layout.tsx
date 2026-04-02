"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { File06, Palette, Settings01, LogOut01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "My Resumes", icon: File06 },
  { href: "/templates", label: "Templates", icon: Palette },
  { href: "/settings", label: "Settings", icon: Settings01 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setUser({
        name: session.user.user_metadata?.full_name || "User",
        email: session.user.email || "",
      });
      setChecking(false);
    });
  }, [router]);

  async function handleLogout() {
    if (!confirm("Are you sure you want to sign out?")) return;
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary text-tertiary">
        <svg className="size-5 animate-spin" viewBox="0 0 20 20" fill="none">
          <circle className="stroke-current opacity-30" cx="10" cy="10" r="8" strokeWidth="2" />
          <circle className="origin-center animate-spin stroke-current" cx="10" cy="10" r="8" strokeWidth="2" strokeDasharray="12.5 50" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-primary">
      {/* Sidebar */}
      <aside className="fixed top-0 bottom-0 left-0 z-50 flex w-[260px] flex-col border-r border-secondary bg-secondary">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-secondary">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white text-xs font-extrabold" style={{ fontFamily: "'Manrope', sans-serif" }}>R</div>
          <div>
            <div className="text-sm font-semibold text-primary" style={{ fontFamily: "'Manrope', sans-serif" }}>ReplugCV</div>
            <div className="text-xs text-tertiary">Free Plan</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition no-underline",
                    isActive
                      ? "bg-active text-secondary_hover"
                      : "text-tertiary hover:bg-primary_hover hover:text-secondary_hover"
                  )}
                >
                  <Icon className={cx("size-5 shrink-0", isActive ? "text-brand-secondary" : "text-fg-quaternary group-hover:text-fg-quaternary_hover")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-secondary px-3 py-4">
          <div className="mb-2 px-3">
            <div className="text-sm font-medium text-primary truncate">{user?.name}</div>
            <div className="text-xs text-tertiary truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-error-primary transition cursor-pointer border-none bg-transparent hover:bg-error-primary"
          >
            <LogOut01 className="size-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-[260px]">
        <div className="px-8 py-8 max-w-[1200px]">
          {children}
        </div>
      </main>
    </div>
  );
}
