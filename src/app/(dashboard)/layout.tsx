import { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";

export const instant = false;

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return <DashboardShell>{children}</DashboardShell>;
}