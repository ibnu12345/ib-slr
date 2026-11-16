"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, BookOpen, Shield, LayoutDashboard, UserCheck, LogOut } from "lucide-react";
import { SiteSettings, NavigationItem } from "../../lib/types/cms";
import { UserSession } from "../../lib/types/auth";
import { logoutAction } from "../../lib/auth/actions";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";
import { useLanguage } from "../i18n/LanguageContext";
import { translateNavLabel } from "../../lib/i18n/cmsTranslations";

interface NavbarProps {
  settings: SiteSettings;
  navItems: NavigationItem[];
  session: UserSession | null;
}

export function Navbar({ settings, navItems, session }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t, isId } = useLanguage();

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E4E7EC] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-[#17324D] flex items-center justify-center text-white shadow-sm group-hover:bg-[#12273D] transition-colors">
                <BookOpen className="w-5 h-5 text-[#3E9C96]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#17324D]">
                  {settings.brandName || "IB-SLR"}
                </span>
                <span className="text-[10px] uppercase font-medium tracking-wider text-[#667085] -mt-1 hidden sm:block">
                  {isId ? "Dari Literatur Menjadi Bukti" : settings.tagline || "From Literature to Evidence"}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#17324D] bg-[#F7F8FA] font-semibold border-b-2 border-[#2F7D78]"
                      : "text-[#667085] hover:text-[#17212B] hover:bg-[#F7F8FA]"
                  }`}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                >
                  {translateNavLabel(item.label, item.url, isId)}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth / App CTAs & Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher variant="header" />

            {session ? (
              <div className="flex items-center gap-2">
                {session.role === "admin" || session.role === "super_admin" ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[#17324D] bg-[#EFF7F6] border border-[#2F7D78]/30 hover:bg-[#D8EDE9] transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#2F7D78]" />
                    {t("nav_admin_cms", "Admin CMS")}
                  </Link>
                ) : null}

                <Link
                  href="/app"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-[#17324D] hover:bg-[#12273D] shadow-sm transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {t("nav_workspace", "Workspace")}
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-[#E4E7EC]">
                  <span className="text-xs text-[#667085] max-w-[120px] truncate font-medium">
                    {session.fullName.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-[#667085] hover:text-[#B42318] hover:bg-[#FEF3F2] rounded-md transition-colors"
                    title={t("nav_logout", "Log out")}
                    aria-label={t("nav_logout", "Log out")}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-[#17212B] hover:text-[#17324D] hover:bg-[#F7F8FA] rounded-md transition-colors"
                >
                  {t("nav_login", "Masuk")}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-[#17324D] hover:bg-[#12273D] rounded-md shadow-sm transition-colors"
                >
                  {t("nav_register", "Daftar Gratis")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Language Switcher */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#667085] hover:text-[#17212B] hover:bg-[#F7F8FA]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E4E7EC] bg-[#FFFFFF] px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-[#17212B] hover:bg-[#F7F8FA]"
            >
              {translateNavLabel(item.label, item.url, isId)}
            </Link>
          ))}

          <div className="pt-4 border-t border-[#E4E7EC] space-y-2">
            {session ? (
              <>
                <div className="px-3 py-1 text-xs text-[#667085]">
                  Signed in as <strong>{session.email}</strong>
                </div>
                {session.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 rounded-md text-sm font-semibold text-[#17324D] bg-[#EFF7F6]"
                  >
                    Admin CMS
                  </Link>
                )}
                <Link
                  href="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-[#17324D]"
                >
                  {t("nav_workspace", "Go to Workspace")}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center px-4 py-2 rounded-md text-sm font-medium text-[#B42318] hover:bg-[#FEF3F2]"
                >
                  {t("nav_logout", "Log Out")}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-3 py-2 rounded-md text-sm font-medium border border-[#E4E7EC] text-[#17212B]"
                >
                  {t("nav_login", "Masuk")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-3 py-2 rounded-md text-sm font-semibold text-white bg-[#17324D]"
                >
                  {t("nav_register", "Daftar Gratis")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
