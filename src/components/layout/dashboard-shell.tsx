"use client";

import { ReactNode, useState } from "react";
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
    <div className="min-h-screen bg-[var(--background)] print:bg-white">
      <div className="print:hidden">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggle={() => setCollapsed((current) => !current)}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </div>

      <div
        className={`min-h-screen transition-all duration-200 print:!ml-0 print:m-0 print:p-0 ${
          collapsed ? "lg:ml-[78px]" : "lg:ml-[250px]"
        }`}
      >
        <div className="print:hidden">
          <Header
            onMenuClick={() => setMobileOpen(true)}
          />
        </div>

        <main className="p-4 sm:p-5 lg:p-6 print:p-0 print:m-0">
          {children}
        </main>
      </div>
    </div>
  );
}
