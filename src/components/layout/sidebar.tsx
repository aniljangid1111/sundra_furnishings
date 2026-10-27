"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Truck,
  Users,
  Warehouse,
  X,
} from "lucide-react";

const menuSections = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Insights",
        href: "/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Invoices",
        href: "/invoices",
        icon: FileText,
      },
      {
        label: "Quotations",
        href: "/quotations",
        icon: FileText,
      },
      {
        label: "Purchases",
        href: "/purchases",
        icon: ShoppingCart,
      },
      {
        label: "Inventory",
        href: "/inventory",
        icon: Warehouse,
      },
      {
        label: "Imports",
        href: "/imports",
        icon: Truck,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Products",
        href: "/products",
        icon: Package,
      },
      {
        label: "Categories",
        href: "/categories",
        icon: Tags,
      },
      {
        label: "Sales Channels",
        href: "/sales-channels",
        icon: Store,
      },
      {
        label: "Customers",
        href: "/customers",
        icon: Users,
      },
      {
        label: "Suppliers",
        href: "/suppliers",
        icon: Users,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggle,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[var(--border)] bg-white transition-all duration-200 ${collapsed ? "lg:w-[78px]" : "lg:w-[250px]"
          } ${mobileOpen
            ? "w-[250px] translate-x-0"
            : "w-[250px] -translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Sidebar header */}
        <div
          className={`relative flex h-[76px] shrink-0 items-center border-b border-[var(--border-light)] ${collapsed ? "justify-center px-3" : "px-5"
            }`}
        >
          {collapsed ? (
            <Link
              href="/dashboard"
              onClick={onCloseMobile}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg"
              title="Sundara Furnishings"
            >
              <Image
                src="/logo.png"
                alt="Sundara Furnishings"
                width={150}
                height={48}
                priority
                className="h-11 w-auto max-w-none"
              />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              onClick={onCloseMobile}
              className="flex items-center"
            >
              <Image
                src="/logo.png"
                alt="Sundara Furnishings"
                width={170}
                height={54}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>
          )}

          {/* Desktop collapse */}
          <button
            type="button"
            onClick={onToggle}
            aria-label={
              collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`absolute top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] shadow-sm transition-all hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] lg:flex ${collapsed ? "right-[-15px]" : "right-3"
              }`}
          >
            {collapsed ? (
              <PanelLeftOpen size={16} strokeWidth={1.8} />
            ) : (
              <PanelLeftClose size={16} strokeWidth={1.8} />
            )}
          </button>

          {/* Mobile close */}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onCloseMobile}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--muted-background)] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex h-11 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm transition-all ${collapsed ? "justify-center" : ""
                        } ${isActive
                          ? "bg-gradient-to-r from-[var(--primary-light)] via-[#eff7f3] to-transparent font-medium text-[var(--primary)]"
                          : "text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
                        }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 h-7 w-[3px] rounded-r-full bg-[var(--primary)]" />
                      )}

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive
                          ? "bg-white text-[var(--primary)] shadow-sm"
                          : "text-[var(--muted)] group-hover:text-[var(--foreground)]"
                          }`}
                      >
                        <Icon size={17} strokeWidth={1.8} />
                      </span>

                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}