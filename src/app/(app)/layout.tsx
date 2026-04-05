"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  SearchLg,
  LayoutGrid01,
  File06,
  Palette,
  BarChart01,
  Stars01,
  Globe01,
  MessageSquare01,
  Link01,
  Settings01,
  Settings02,
  Diamond01,
  HelpCircle,
  ChevronDown,
} from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { Badge } from "@/components/base/badges/badges";
import { useTheme } from "@/components/theme-provider";

const MAIN_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid01 },
  { href: "/resumes", label: "My Resumes", icon: File06 },
  { href: "/templates", label: "Templates Library", icon: Palette },
  { href: "/analytics", label: "Analytics", icon: BarChart01 },
];

const AI_NAV = [
  { href: "/ai-insights", label: "AI Insights", icon: Stars01 },
  { href: "/job-match", label: "Job Match", icon: Globe01 },
  { href: "/ai-assistant", label: "AI Assistant", icon: MessageSquare01 },
  { href: "/integrations", label: "Integrations", icon: Link01 },
  { href: "/ai-experiments", label: "AI Experiments", icon: Settings02, badge: "BETA" },
];

const BOTTOM_NAV = [
  { href: "/plans", label: "Plans", icon: Diamond01 },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings01 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();
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

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
    <div className="flex h-screen overflow-hidden bg-primary">
      {/* Sidebar */}
      <aside className="fixed top-0 bottom-0 left-0 z-50 flex w-[280px] flex-col border-r border-secondary bg-primary">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-4">
          <div
            className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white text-sm font-extrabold shadow-sm"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            R
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-primary" style={{ fontFamily: "'Manrope', sans-serif" }}>
              ReplugCV
            </span>
            <span className="text-[11px] text-quaternary">Free Plan</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 rounded-lg border border-secondary bg-secondary px-3 py-2">
            <SearchLg className="size-4 shrink-0 text-fg-quaternary" />
            <span className="text-sm text-quaternary">Search anything</span>
          </div>
        </div>

        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {/* Main nav */}
          <div className="flex flex-col gap-0.5">
            {MAIN_NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline",
                    active
                      ? "bg-[#8B5CF6]/8 text-[#8B5CF6] font-semibold"
                      : "text-tertiary hover:bg-secondary hover:text-primary"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#8B5CF6]" />
                  )}
                  <Icon className={cx("size-5 shrink-0", active ? "text-[#8B5CF6]" : "text-fg-quaternary group-hover:text-fg-quaternary_hover")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* AI Features section */}
          <div className="mt-6 mb-2 px-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-quaternary">
              AI Features
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {AI_NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline",
                    active
                      ? "bg-[#8B5CF6]/8 text-[#8B5CF6] font-semibold"
                      : "text-tertiary hover:bg-secondary hover:text-primary"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#8B5CF6]" />
                  )}
                  <Icon className={cx("size-5 shrink-0", active ? "text-[#8B5CF6]" : "text-fg-quaternary group-hover:text-fg-quaternary_hover")} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge type="pill-color" size="sm" color="brand">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="border-t border-secondary px-3 py-3">
          <div className="flex flex-col gap-0.5">
            {BOTTOM_NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline",
                    active
                      ? "bg-[#8B5CF6]/8 text-[#8B5CF6] font-semibold"
                      : "text-tertiary hover:bg-secondary hover:text-primary"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#8B5CF6]" />
                  )}
                  <Icon className={cx("size-5 shrink-0", active ? "text-[#8B5CF6]" : "text-fg-quaternary group-hover:text-fg-quaternary_hover")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-tertiary transition-colors cursor-pointer border-none bg-transparent hover:bg-secondary hover:text-primary"
            >
              {theme === "dark" ? (
                <svg className="size-5 shrink-0 text-fg-quaternary group-hover:text-fg-quaternary_hover" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg className="size-5 shrink-0 text-fg-quaternary group-hover:text-fg-quaternary_hover" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>

        {/* User footer */}
        <div className="border-t border-secondary px-4 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors cursor-pointer border-none bg-transparent hover:bg-secondary group"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-[#8B5CF6] text-white text-xs font-bold shrink-0">
              {user ? getInitials(user.name) : "U"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-primary truncate">{user?.name}</div>
              <div className="text-xs text-quaternary truncate">{user?.email}</div>
            </div>
            <ChevronDown className="size-4 shrink-0 text-fg-quaternary" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-[280px] overflow-y-auto">
        <div className="px-8 py-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
