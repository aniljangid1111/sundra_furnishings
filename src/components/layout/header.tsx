"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { ProfileDrawer, type ProfileData } from "./profile-drawer";
import { useAuth } from "@/lib/auth/auth-context";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({
  onMenuClick,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // User Profile state synced with auth
  const [profile, setProfile] = useState<ProfileData>({
    firstName: user?.name ? user.name.split(" ")[0] : "Admin",
    lastName: user?.name ? user.name.split(" ").slice(1).join(" ") : "User",
    contactNumber: "+1 (704) 555-0199",
    role: user?.roleTitle || (user?.role === "ADMIN" ? "Administrator" : "Staff"),
    email: user?.email || "admin@sundarafurnishings.com"
  });

  useEffect(() => {
    if (user) {
      const parts = (user.name || "Admin").split(" ");
      setProfile({
        firstName: parts[0] || "Admin",
        lastName: parts.slice(1).join(" ") || "",
        contactNumber: "+1 (704) 555-0199",
        role: user.roleTitle || (user.role === "ADMIN" ? "Administrator" : "Staff"),
        email: user.email || ""
      });
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileSave = (updated: ProfileData, _newPassword?: string) => {
    setProfile(updated);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur sm:px-5 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            aria-label="Open navigation"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--muted-background)] lg:hidden"
          >
            <Menu size={19} />
          </button>

          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoices, products, customers..."
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--muted-background)] pl-9 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:bg-white"
            />
          </div>
        </div>

        {/* Actions & Profile Dropdown */}
        <div className="ml-3 flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Profile Trigger Button */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              className={`flex items-center gap-2 rounded-xl p-1.5 transition sm:px-2 ${isDropdownOpen
                  ? "bg-[var(--muted-background)] ring-1 ring-[var(--border)]"
                  : "hover:bg-[var(--muted-background)]"
                }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-light)] text-sm font-bold text-[var(--primary)] shadow-2xs">
                {profile.firstName?.[0] || "S"}
              </div>

              <div className="hidden text-left md:block">
                <p className="text-xs font-bold text-[var(--foreground)] leading-tight">
                  {profile.firstName} {profile.lastName}
                </p>

                <p className="text-2xs text-[var(--muted)] leading-tight mt-0.5">
                  {profile.role}
                </p>
              </div>

              <ChevronDown
                size={14}
                className={`hidden text-[var(--muted)] transition-transform duration-200 md:block ${isDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Dropdown Menu (Animated) */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50">
                {/* User Info Header Card */}
                <div className="rounded-xl bg-slate-50 p-3 mb-1 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-white font-bold text-sm">
                      {profile.firstName?.[0] || "S"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">
                        {profile.firstName} {profile.lastName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dropdown Options */}
                <div className="space-y-0.5 text-xs">
                  {/* View / Edit Profile Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsDrawerOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left font-medium text-slate-700 hover:bg-[var(--muted-background)] hover:text-[var(--primary)] transition"
                  >
                    <User size={18} className="text-[var(--primary)] shrink-0" />
                    <div>
                      <p className="font-semibold text-sm leading-none">Profile</p>
                    </div>
                  </button>

                  {/* Settings Link */}
                  <Link
                    href="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left font-medium text-slate-700 hover:bg-[var(--muted-background)] hover:text-[var(--primary)] transition"
                  >
                    <Settings size={18} className="text-slate-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-xs leading-none">Settings & Policies</p>
                    </div>
                  </Link>
                </div>

                <div className="my-1 border-t border-slate-100" />

                {/* Log Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs! font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut size={15} className="text-rose-500 shrink-0" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Profile Drawer (Right Side) */}
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        profile={profile}
        onSave={handleProfileSave}
      />
    </>
  );
}