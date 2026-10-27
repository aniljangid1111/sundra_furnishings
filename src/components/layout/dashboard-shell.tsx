"use client";

import { ReactNode, Suspense, useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Suspense fallback={null}>
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggle={() => setCollapsed((current) => !current)}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </Suspense>

      <div
        className={`min-h-screen transition-all duration-200 ${
          collapsed ? "lg:ml-[78px]" : "lg:ml-[250px]"
        }`}
      >
        <Header
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}