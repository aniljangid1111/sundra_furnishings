"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
  XCircle,
} from "lucide-react";
import { standardModules } from "@/features/roles/role.data";
import { UserAccount } from "@/features/users/user.types";
import { UserRole } from "@/features/roles/role.types";
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  resetUserPasswordApi,
  deleteUserApi,
  type UserKPI,
} from "@/lib/api/user.api";
import { getRolesApi } from "@/lib/api/role.api";
import { CountUp } from "@/components/ui/count-up";
import { PermissionGate } from "@/lib/auth/permission-gate";

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [kpi, setKpi] = useState<UserKPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [viewingUserAccess, setViewingUserAccess] = useState<UserAccount | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<UserAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add / Edit Form State
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formRoleId, setFormRoleId] = useState("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  // Reset Password Modal State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [requireChangeOnLogin, setRequireChangeOnLogin] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        getUsersApi({ search: search.trim() || undefined, page, limit: 10 }),
        getRolesApi(),
      ]);

      if (uRes.success && uRes.data) {
        setUsers(uRes.data);
        if (uRes.kpi) setKpi(uRes.kpi);
        if (uRes.pagination) setPagination(uRes.pagination);
      }
      if (rRes.success && rRes.data) {
        setRoles(rRes.data);
        if (!formRoleId && rRes.data[0]) {
          setFormRoleId(rRes.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SF@${pwd}`;
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormName("");
    setFormMobile("+1 (704) 555-");
    setFormEmail("");
    setFormPassword("Sundara@2026!");
    setShowPassword(false);
    setFormRoleId(roles[1]?.id || roles[0]?.id || "");
    setFormStatus("ACTIVE");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormMobile(u.mobile);
    setFormEmail(u.email);
    setFormPassword("");
    setShowPassword(false);
    setFormRoleId(u.roleId);
    setFormStatus(u.status);
    setIsModalOpen(true);
  };

  const handleOpenResetPassword = (u: UserAccount) => {
    setPasswordResetUser(u);
    const generated = generateRandomPassword();
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowNewPassword(true);
    setRequireChangeOnLogin(true);
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser) return;

    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetUserPasswordApi(
        passwordResetUser.id,
        newPassword,
        requireChangeOnLogin
      );
      if (res.success) {
        showToast(`Password successfully reset for "${passwordResetUser.name}".`);
        setPasswordResetUser(null);
        fetchUsers(currentPage);
      } else {
        alert(res.message || "Failed to reset password");
      }
    } catch (err: any) {
      alert(err?.message || "An error occurred while resetting password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const nextStatus = target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const res = await updateUserApi(id, { status: nextStatus });
      if (res.success) {
        showToast(`User "${target.name}" status changed to ${nextStatus.toLowerCase()}.`);
        fetchUsers(currentPage);
      } else {
        alert(res.message || "Failed to update user status");
      }
    } catch (err: any) {
      alert(err?.message || "Error updating user status");
    }
  };

  const handleDeleteUser = async (u: UserAccount) => {
    if (confirm(`Are you sure you want to delete user "${u.name}"?`)) {
      try {
        const res = await deleteUserApi(u.id);
        if (res.success) {
          showToast(`User "${u.name}" deleted.`);
          fetchUsers(currentPage);
        } else {
          alert(res.message || "Failed to delete user");
        }
      } catch (err: any) {
        alert(err?.message || "Error deleting user");
      }
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      alert("Name and Email are required for login credentials.");
      return;
    }

    const selectedRole = roles.find((r) => r.id === formRoleId) || roles[0];

    setIsSubmitting(true);
    try {
      if (editingUser) {
        const payload = {
          name: formName.trim(),
          mobile: formMobile.trim(),
          email: formEmail.trim(),
          role: selectedRole?.name,
          roleId: selectedRole?.id,
          status: formStatus,
        };
        const res = await updateUserApi(editingUser.id, payload);
        if (res.success) {
          showToast(`User "${formName.trim()}" updated.`);
          setIsModalOpen(false);
          fetchUsers(currentPage);
        } else {
          alert(res.message || "Failed to update user");
        }
      } else {
        const payload = {
          name: formName.trim(),
          mobile: formMobile.trim() || "+1 (704) 555-0100",
          email: formEmail.trim(),
          password: formPassword.trim() || "Sundara@2026!",
          role: selectedRole?.name,
          roleId: selectedRole?.id || "role-employee",
          status: formStatus,
          avatarBg: "bg-emerald-700 text-white",
        };
        const res = await createUserApi(payload);
        if (res.success) {
          showToast(`User "${formName.trim()}" created successfully.`);
          setIsModalOpen(false);
          fetchUsers(currentPage);
        } else {
          alert(res.message || "Failed to create user");
        }
      }
    } catch (err: any) {
      alert(err?.message || "Error saving user account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoleDetails = roles.find((r) => r.id === formRoleId);
  const viewingUserRole = viewingUserAccess ? roles.find((r) => r.id === viewingUserAccess.roleId) : null;

  // KPIs
  const totalUsers = kpi?.totalUsers ?? users.length;
  const activeUsers = kpi?.activeUsers ?? users.filter((u) => u.status === "ACTIVE").length;
  const inactiveUsers = kpi?.inactiveUsers ?? users.filter((u) => u.status === "INACTIVE").length;
  const rolesInUseCount = new Set(users.map((u) => u.roleId)).size;

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-700" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            User Management
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Create users, set login credentials, and assign roles
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/roles"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-xs font-medium text-[var(--foreground)] shadow-xs hover:bg-[var(--muted-background)]"
          >
            <ShieldCheck size={16} className="text-[var(--primary)]" />
            <span>Manage Roles</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)] active:scale-95"
          >
            <Plus size={17} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL USERS */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Users size={18} />
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            TOTAL USERS
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            <CountUp value={totalUsers} isLoading={isLoading} />
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Registered staff</p>
        </div>

        {/* ACTIVE USERS */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <UserCheck size={18} />
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            ACTIVE USERS
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            <CountUp value={activeUsers} isLoading={isLoading} />
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Operational accounts</p>
        </div>

        {/* INACTIVE USERS */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
              <UserX size={18} />
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            INACTIVE USERS
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            <CountUp value={inactiveUsers} isLoading={isLoading} />
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Access paused</p>
        </div>

        {/* ROLES IN USE */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-700">
              <Shield size={18} />
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            ROLES IN USE
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            <CountUp value={rolesInUseCount} isLoading={isLoading} />
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Permission tiers</p>
        </div>
      </div>

      {/* Main Table Card */}
      <section className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="border-b border-[var(--border)] p-4">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              placeholder="Search user by name, email or role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input !pl-10 text-xs"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-[var(--muted-background)]/50 text-2xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3.5">USER</th>
                <th className="px-5 py-3.5">MOBILE</th>
                <th className="px-5 py-3.5">EMAIL</th>
                <th className="px-5 py-3.5">ROLE & PERMISSIONS</th>
                <th className="px-5 py-3.5">STATUS</th>
                <th className="px-5 py-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-xs text-[var(--muted)]">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => {
                  const userRole = roles.find((r) => r.id === user.roleId);
                  const enabledCount = userRole?.modules.length || 0;

                  return (
                    <tr
                      key={user.id}
                      className="transition hover:bg-[var(--muted-background)]/30"
                    >
                      {/* USER: Avatar + Full Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 font-bold text-xs text-white">
                            {user.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">{user.name}</p>
                          </div>
                        </div>
                      </td>

                      {/* MOBILE */}
                      <td className="px-5 py-3.5 text-slate-700 font-normal">
                        {user.mobile}
                      </td>

                      {/* EMAIL */}
                      <td className="px-5 py-3.5 text-slate-600 font-normal">
                        {user.email}
                      </td>

                      {/* ROLE */}
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => setViewingUserAccess(user)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-[var(--primary)] hover:bg-emerald-50/40"
                          title="Click to view module access & CRUD rights"
                        >
                          <Shield size={13} className="text-slate-500 shrink-0" />
                          <span>{user.role}</span>
                          <span className="text-2xs text-[var(--muted)] font-mono">
                            ({enabledCount} mods)
                          </span>
                        </button>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition ${
                            user.status === "ACTIVE"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                              : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.status === "ACTIVE" ? "bg-emerald-700" : "bg-slate-400"
                            }`}
                          />
                          <span>{user.status === "ACTIVE" ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* ACTIONS: Reset Password + View + Edit + Delete */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Admin Direct Password Reset Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenResetPassword(user)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-600 transition hover:bg-amber-50 hover:text-amber-800"
                            title="Admin Direct Password Reset (No current password needed)"
                          >
                            <KeyRound size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setViewingUserAccess(user)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[var(--primary)]"
                            title="View Permissions Matrix"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            title="Edit User Details"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-xs text-[var(--muted)]">
                    No users match "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border-light)] px-5 py-3 sm:flex-row">
          <p className="text-xs text-[var(--muted)]">
            Showing {users.length} of {pagination.totalItems} users (Page {pagination.currentPage} of {pagination.totalPages || 1})
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrevPage || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)] disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-xs font-medium px-1 text-[var(--muted)]">
              {pagination.currentPage} / {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)] disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Admin Direct Password Reset Modal */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[var(--border-light)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    <KeyRound size={16} />
                  </span>
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    Reset User Password
                  </h3>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Setting new credentials for <strong className="text-slate-800">{passwordResetUser.name}</strong> ({passwordResetUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPasswordResetUser(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Admin Authority Banner */}
            <div className="mt-3.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-2xs text-amber-900 leading-relaxed">
              <span className="font-bold">Administrator Authority:</span> You can override and set a new password directly. You do <strong>not</strong> need the user's current password.
            </div>

            <form onSubmit={handleSaveResetPassword} className="mt-4 space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pwd = generateRandomPassword();
                      setNewPassword(pwd);
                      setConfirmPassword(pwd);
                    }}
                    className="flex items-center gap-1 text-2xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    <RefreshCw size={11} /> Generate Secure
                  </button>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input pr-10 text-xs font-mono"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input mt-1 text-xs font-mono"
                  placeholder="Re-enter new password"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireChangeOnLogin}
                  onChange={(e) => setRequireChangeOnLogin(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[var(--primary)]"
                />
                <span className="text-2xs text-slate-700">
                  Require user to change this password on their next sign-in
                </span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="h-9 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--foreground)] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-xs font-semibold text-white! shadow-sm hover:bg-[var(--primary-dark)]"
                >
                  <KeyRound size={14} />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Access & CRUD Rights Inspection Modal */}
      {viewingUserAccess && viewingUserRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[var(--border-light)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  Access Permissions: {viewingUserAccess.name}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Role: <span className="font-semibold text-slate-800">{viewingUserRole.name}</span> • Login: {viewingUserAccess.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingUserAccess(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border)] bg-[var(--muted-background)]/50 text-2xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  <tr>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">View</th>
                    <th className="py-2.5 px-3 text-center">Add</th>
                    <th className="py-2.5 px-3 text-center">Edit</th>
                    <th className="py-2.5 px-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {standardModules.map((m) => {
                    const isEnabled = viewingUserRole.modules.includes(m.key);
                    const crud = viewingUserRole.permissions?.[m.key] || {
                      canView: isEnabled,
                      canCreate: isEnabled,
                      canEdit: isEnabled,
                      canDelete: false,
                    };

                    return (
                      <tr key={m.id} className={isEnabled ? "bg-white" : "bg-slate-50/60 text-slate-400"}>
                        <td className="py-2.5 px-3 font-medium">
                          {m.name}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isEnabled ? (
                            <span className="text-2xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Enabled
                            </span>
                          ) : (
                            <span className="text-2xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              No Access
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {crud.canView ? (
                            <CheckCircle2 size={15} className="text-emerald-700 mx-auto" />
                          ) : (
                            <XCircle size={15} className="text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {crud.canCreate ? (
                            <CheckCircle2 size={15} className="text-emerald-700 mx-auto" />
                          ) : (
                            <XCircle size={15} className="text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {crud.canEdit ? (
                            <CheckCircle2 size={15} className="text-emerald-700 mx-auto" />
                          ) : (
                            <XCircle size={15} className="text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {crud.canDelete ? (
                            <CheckCircle2 size={15} className="text-emerald-700 mx-auto" />
                          ) : (
                            <XCircle size={15} className="text-slate-300 mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--border-light)] pt-3">
              <Link
                href="/roles"
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <ShieldCheck size={14} />
                <span>Change permissions in Role Management →</span>
              </Link>
              <button
                type="button"
                onClick={() => setViewingUserAccess(null)}
                className="h-9 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--foreground)] hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[var(--border-light)] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">
                  {editingUser ? `Edit User: ${editingUser.name}` : "Create New User"}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Assign user login credentials (email/mobile + password) and select their operational role.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="mt-4 space-y-3.5 text-xs">
              {/* Full Name */}
              <div>
                <label className="font-semibold text-slate-800">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Rathi"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="form-input mt-1 text-xs"
                />
              </div>

              {/* Email (Primary Login) & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800">
                    Email Address (Login ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aarav@sundarafurnishings.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="form-input mt-1 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-800">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (704) 555-0112"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    className="form-input mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    {editingUser ? "Change Password (Leave blank to keep current)" : "Login Password"} {!editingUser && <span className="text-rose-500">*</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pwd = generateRandomPassword();
                      setFormPassword(pwd);
                      setShowPassword(true);
                    }}
                    className="flex items-center gap-1 text-2xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    <RefreshCw size={11} /> Generate
                  </button>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!editingUser}
                    placeholder={editingUser ? "Enter new password or leave blank" : "Enter initial login password"}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="form-input pr-10 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="font-semibold text-slate-800">
                  Assigned Role <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1">
                  <select
                    value={formRoleId}
                    onChange={(e) => setFormRoleId(e.target.value)}
                    className="form-input appearance-none pr-10 text-xs font-medium"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.modules.length} modules enabled)
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  />
                </div>
              </div>

              {/* Role Access Summary Preview */}
              {selectedRoleDetails && (
                <div className="rounded-xl border border-[var(--border)] bg-slate-50/70 p-3 space-y-2">
                  <div className="flex items-center justify-between text-2xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider">
                      Role Permissions Overview ({selectedRoleDetails.modules.length} Modules):
                    </span>
                    <span className="font-semibold text-emerald-800">
                      CRUD Enabled
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                    {standardModules.map((m) => {
                      const isModEnabled = selectedRoleDetails.modules.includes(m.key);
                      const crud = selectedRoleDetails.permissions?.[m.key];
                      if (!isModEnabled) return null;

                      return (
                        <div
                          key={m.id}
                          className="rounded bg-white border border-slate-200 p-1.5 text-2xs flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-800 truncate">{m.name}</span>
                          <div className="flex items-center gap-0.5 text-[9px] font-mono shrink-0">
                            <span className={crud?.canView ? "text-slate-800 font-bold" : "text-slate-300"}>V</span>
                            <span className={crud?.canCreate ? "text-emerald-700 font-bold" : "text-slate-300"}>C</span>
                            <span className={crud?.canEdit ? "text-blue-700 font-bold" : "text-slate-300"}>E</span>
                            <span className={crud?.canDelete ? "text-rose-700 font-bold" : "text-slate-300"}>D</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="font-semibold text-slate-800">Status</label>
                <div className="relative mt-1">
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                    className="form-input appearance-none pr-10 text-xs font-medium"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--foreground)] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-xs font-semibold text-white! shadow-sm hover:bg-[var(--primary-dark)]"
                >
                  <Check size={16} />
                  <span>{editingUser ? "Save Changes" : "Save User"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
