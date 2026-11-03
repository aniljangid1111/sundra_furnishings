"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Circle,
  Edit2,
  Eye,
  Layers,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  allModuleKeys,
  standardModules,
} from "@/features/roles/role.data";
import { ModuleCRUD, UserRole } from "@/features/roles/role.types";
import {
  getRolesApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
} from "@/lib/api/role.api";
import { CountUp } from "@/components/ui/count-up";
import { PermissionGate } from "@/lib/auth/permission-gate";

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [formPermissions, setFormPermissions] = useState<Record<string, ModuleCRUD>>({});
  const [inspectRole, setInspectRole] = useState<UserRole | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await getRolesApi();
      if (res.success && res.data) {
        setRoles(res.data);
      }
    } catch (err) {
      console.error("Failed to load roles", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // KPIs
  const totalRoles = roles.length;
  const activeRoles = roles.filter((r) => r.status === "ACTIVE").length;
  const usersAssigned = roles.reduce((sum, r) => sum + r.userCount, 0);
  const totalModulesCount = standardModules.length;

  const handleOpenAddModal = () => {
    setEditingRole(null);
    setFormName("");
    setFormDesc("");
    setFormStatus("ACTIVE");

    // Initialize default permissions
    const initPerms: Record<string, ModuleCRUD> = {};
    allModuleKeys.forEach((k) => {
      const isDefault = ["dashboard", "insights", "invoice", "quotation", "catalogue"].includes(k);
      initPerms[k] = {
        canView: isDefault,
        canCreate: ["invoice", "quotation"].includes(k),
        canEdit: ["invoice", "quotation"].includes(k),
        canDelete: false,
      };
    });
    setFormPermissions(initPerms);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: UserRole) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDesc(role.description || "");
    setFormStatus(role.status);

    // Deep clone permissions
    const clonedPerms: Record<string, ModuleCRUD> = {};
    allModuleKeys.forEach((k) => {
      const existing = role.permissions?.[k];
      const isModEnabled = role.modules.includes(k);
      clonedPerms[k] = existing
        ? { ...existing }
        : {
            canView: isModEnabled,
            canCreate: isModEnabled,
            canEdit: isModEnabled,
            canDelete: false,
          };
    });
    setFormPermissions(clonedPerms);
    setIsModalOpen(true);
  };

  // Granular Action toggles in form
  const handleToggleModuleMaster = (key: string) => {
    setFormPermissions((prev) => {
      const current = prev[key] || { canView: false, canCreate: false, canEdit: false, canDelete: false };
      const nextView = !current.canView;
      return {
        ...prev,
        [key]: {
          canView: nextView,
          canCreate: nextView ? current.canCreate : false,
          canEdit: nextView ? current.canEdit : false,
          canDelete: nextView ? current.canDelete : false,
        },
      };
    });
  };

  const handleToggleAction = (key: string, action: "canView" | "canCreate" | "canEdit" | "canDelete") => {
    setFormPermissions((prev) => {
      const current = prev[key] || { canView: false, canCreate: false, canEdit: false, canDelete: false };
      const nextVal = !current[action];
      return {
        ...prev,
        [key]: {
          ...current,
          [action]: nextVal,
          // Auto-enable view if creating, editing or deleting
          canView: action !== "canView" && nextVal ? true : action === "canView" ? nextVal : current.canView,
        },
      };
    });
  };

  const handleSetRowPreset = (key: string, type: "FULL" | "VIEW_EDIT" | "VIEW_ONLY" | "NONE") => {
    setFormPermissions((prev) => ({
      ...prev,
      [key]: {
        canView: type !== "NONE",
        canCreate: type === "FULL" || type === "VIEW_EDIT",
        canEdit: type === "FULL" || type === "VIEW_EDIT",
        canDelete: type === "FULL",
      },
    }));
  };

  const handleSetAllPreset = (type: "FULL" | "VIEW_ONLY" | "CLEAR") => {
    const updated: Record<string, ModuleCRUD> = {};
    allModuleKeys.forEach((k) => {
      updated[k] = {
        canView: type !== "CLEAR",
        canCreate: type === "FULL",
        canEdit: type === "FULL",
        canDelete: type === "FULL",
      };
    });
    setFormPermissions(updated);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Role Name is required.");
      return;
    }

    const code = formName.trim().toUpperCase().replace(/\s+/g, "_");
    const enabledModules = Object.keys(formPermissions).filter((k) => formPermissions[k]?.canView);

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        code,
        description: formDesc.trim() || undefined,
        status: formStatus,
        modules: enabledModules,
        permissions: formPermissions,
      };

      if (editingRole) {
        const res = await updateRoleApi(editingRole.id, payload);
        if (res.success) {
          showToast(`Role "${formName.trim()}" updated successfully.`);
          fetchRoles();
          setIsModalOpen(false);
        } else {
          alert(res.message || "Failed to update role");
        }
      } else {
        const res = await createRoleApi(payload);
        if (res.success) {
          showToast(`New role "${formName.trim()}" created successfully.`);
          fetchRoles();
          setIsModalOpen(false);
        } else {
          alert(res.message || "Failed to create role");
        }
      }
    } catch (err: any) {
      alert(err?.message || "An error occurred while saving role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: UserRole) => {
    if (role.isSystem) {
      alert("Administrator role cannot be deleted.");
      return;
    }
    if (confirm(`Are you sure you want to delete "${role.name}"?`)) {
      try {
        const res = await deleteRoleApi(role.id);
        if (res.success) {
          showToast(`Role "${role.name}" has been deleted.`);
          fetchRoles();
        } else {
          alert(res.message || "Failed to delete role");
        }
      } catch (err: any) {
        alert(err?.message || "An error occurred while deleting role");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Role Management
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Define module-level access and CRUD permissions per role
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)] active:scale-95"
        >
          <Plus size={17} />
          <span>Add Role</span>
        </button>
      </div>

      {/* KPI Cards Row (Matching Reference) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL ROLES */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Shield size={18} />
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            TOTAL ROLES
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            <CountUp value={totalRoles} isLoading={isLoading} />
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Defined</p>
        </div>

        {/* ACTIVE ROLES */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            ACTIVE ROLES
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            <CountUp value={activeRoles} isLoading={isLoading} />
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Assignable</p>
        </div>

        {/* USERS ASSIGNED */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
              <Users size={18} />
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            USERS ASSIGNED
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            <CountUp value={usersAssigned} isLoading={isLoading} />
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Across all roles</p>
        </div>

        {/* MODULES */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
              <Layers size={18} />
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            MODULES
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            <CountUp value={totalModulesCount} isLoading={isLoading} />
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Governable</p>
        </div>
      </div>

      {/* Grid Subtitle */}
      <div>
        <p className="text-xs text-[var(--muted)]">
          Define which modules each role can access across the platform and their CRUD rights (View, Add, Edit, Delete).
        </p>
      </div>

      {/* Role Cards Grid (Matching Reference Image 3 & 4 with CRUD Tags) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {roles.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] bg-white p-12 text-center">
            <Shield size={36} className="mx-auto text-[var(--muted)]/50" />
            <p className="mt-3 text-base font-semibold text-[var(--foreground)]">No custom roles defined yet</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Click &quot;Add Role&quot; above to define user privilege tiers.</p>
          </div>
        ) : (
          roles.map((role) => {
            const col1Modules = standardModules.filter((m) => m.column === 1);
            const col2Modules = standardModules.filter((m) => m.column === 2);
            const enabledCount = role.modules.length;

          return (
            <div
              key={role.id}
              className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs transition hover:shadow-xs"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-[var(--border-light)] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    {role.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {enabledCount} of {totalModulesCount} modules enabled
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-2xs font-semibold text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
                    Active
                  </span>

                  <button
                    type="button"
                    onClick={() => setInspectRole(role)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    title="Inspect CRUD Matrix"
                  >
                    <Eye size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(role)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    title="Edit Role & Permissions"
                  >
                    <Edit2 size={14} />
                  </button>

                  {!role.isSystem && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRole(role)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-500 transition hover:bg-rose-50"
                      title="Delete Role"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body - 2 Columns of 6 Modules each */}
              <div className="grid grid-cols-2 gap-x-5 gap-y-3 pt-4 text-xs">
                {/* Column 1 */}
                <div className="space-y-3">
                  {col1Modules.map((m) => {
                    const isEnabled = role.modules.includes(m.key);
                    const crud = role.permissions?.[m.key] || {
                      canView: isEnabled,
                      canCreate: isEnabled,
                      canEdit: isEnabled,
                      canDelete: false,
                    };

                    return (
                      <div key={m.id} className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {isEnabled ? (
                            <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                          ) : (
                            <Circle size={15} className="text-slate-300 shrink-0" />
                          )}
                          <span
                            className={`truncate ${
                              isEnabled
                                ? "font-medium text-slate-800"
                                : "text-slate-400 font-normal"
                            }`}
                          >
                            {m.name}
                          </span>
                        </div>

                        {/* Subtle CRUD Badges if Enabled */}
                        {isEnabled && (
                          <div className="flex items-center gap-0.5 shrink-0 font-mono text-[9px]">
                            <span
                              title="View"
                              className={`px-1 py-0.5 rounded ${
                                crud.canView ? "bg-slate-100 text-slate-700 font-semibold" : "text-slate-300"
                              }`}
                            >
                              V
                            </span>
                            <span
                              title="Add / Create"
                              className={`px-1 py-0.5 rounded ${
                                crud.canCreate ? "bg-emerald-50 text-emerald-800 font-semibold" : "text-slate-300"
                              }`}
                            >
                              C
                            </span>
                            <span
                              title="Edit"
                              className={`px-1 py-0.5 rounded ${
                                crud.canEdit ? "bg-blue-50 text-blue-800 font-semibold" : "text-slate-300"
                              }`}
                            >
                              E
                            </span>
                            <span
                              title="Delete"
                              className={`px-1 py-0.5 rounded ${
                                crud.canDelete ? "bg-rose-50 text-rose-800 font-semibold" : "text-slate-300"
                              }`}
                            >
                              D
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                  {col2Modules.map((m) => {
                    const isEnabled = role.modules.includes(m.key);
                    const crud = role.permissions?.[m.key] || {
                      canView: isEnabled,
                      canCreate: isEnabled,
                      canEdit: isEnabled,
                      canDelete: false,
                    };

                    return (
                      <div key={m.id} className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {isEnabled ? (
                            <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                          ) : (
                            <Circle size={15} className="text-slate-300 shrink-0" />
                          )}
                          <span
                            className={`truncate ${
                              isEnabled
                                ? "font-medium text-slate-800"
                                : "text-slate-400 font-normal"
                            }`}
                          >
                            {m.name}
                          </span>
                        </div>

                        {/* Subtle CRUD Badges if Enabled */}
                        {isEnabled && (
                          <div className="flex items-center gap-0.5 shrink-0 font-mono text-[9px]">
                            <span
                              title="View"
                              className={`px-1 py-0.5 rounded ${
                                crud.canView ? "bg-slate-100 text-slate-700 font-semibold" : "text-slate-300"
                              }`}
                            >
                              V
                            </span>
                            <span
                              title="Add / Create"
                              className={`px-1 py-0.5 rounded ${
                                crud.canCreate ? "bg-emerald-50 text-emerald-800 font-semibold" : "text-slate-300"
                              }`}
                            >
                              C
                            </span>
                            <span
                              title="Edit"
                              className={`px-1 py-0.5 rounded ${
                                crud.canEdit ? "bg-blue-50 text-blue-800 font-semibold" : "text-slate-300"
                              }`}
                            >
                              E
                            </span>
                            <span
                              title="Delete"
                              className={`px-1 py-0.5 rounded ${
                                crud.canDelete ? "bg-rose-50 text-rose-800 font-semibold" : "text-slate-300"
                              }`}
                            >
                              D
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Inspect CRUD Matrix Modal */}
      {inspectRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[var(--border-light)] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">
                  {inspectRole.name} — Full Permissions Matrix
                </h3>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {inspectRole.description || "Operational access rules and CRUD permissions."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectRole(null)}
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
                    <th className="py-2.5 px-3 text-center">Add / Create</th>
                    <th className="py-2.5 px-3 text-center">Edit</th>
                    <th className="py-2.5 px-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {standardModules.map((m) => {
                    const isEnabled = inspectRole.modules.includes(m.key);
                    const crud = inspectRole.permissions?.[m.key] || {
                      canView: isEnabled,
                      canCreate: isEnabled,
                      canEdit: isEnabled,
                      canDelete: false,
                    };

                    return (
                      <tr key={m.id} className={isEnabled ? "bg-white" : "bg-slate-50/60"}>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {m.name}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isEnabled ? (
                            <span className="text-2xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Enabled
                            </span>
                          ) : (
                            <span className="text-2xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              Disabled
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

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectRole(null)}
                className="h-9 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--foreground)] hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Role Modal with Granular CRUD Checkboxes */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-[var(--border-light)] pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">
                  {editingRole ? `Edit Role: ${editingRole.name}` : "Create New Role"}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Configure which modules and actions (View, Add, Edit, Delete) users assigned this role will have.
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

            <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-800">
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Warehouse Supervisor"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="form-input mt-1 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Manages inventory inward, outward, and stock adjustments."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="form-input mt-1 text-xs"
                />
              </div>

              {/* Module & CRUD Permissions Section */}
              <div className="rounded-xl border border-[var(--border)] bg-slate-50/60 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--border-light)] pb-2.5">
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-2xs">
                      Module Access & CRUD Actions
                    </span>
                    <p className="text-2xs text-[var(--muted)]">
                      Toggle access and specific rights for each module.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-2xs">
                    <button
                      type="button"
                      onClick={() => handleSetAllPreset("FULL")}
                      className="font-semibold text-[var(--primary)] hover:underline"
                    >
                      All Full CRUD
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleSetAllPreset("VIEW_ONLY")}
                      className="font-semibold text-blue-700 hover:underline"
                    >
                      All View Only
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleSetAllPreset("CLEAR")}
                      className="font-semibold text-rose-600 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-[var(--border-light)] rounded-lg border border-[var(--border)] bg-white overflow-hidden">
                  {standardModules.map((m) => {
                    const perm = formPermissions[m.key] || {
                      canView: false,
                      canCreate: false,
                      canEdit: false,
                      canDelete: false,
                    };
                    const isEnabled = perm.canView;

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 gap-2 transition ${
                          isEnabled ? "bg-white" : "bg-slate-50/70"
                        }`}
                      >
                        {/* Master Module Checkbox */}
                        <label className="flex items-center gap-2.5 cursor-pointer min-w-0 sm:w-48">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => handleToggleModuleMaster(m.key)}
                            className="h-4 w-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <span
                            className={`font-semibold text-xs truncate ${
                              isEnabled ? "text-slate-800" : "text-slate-400"
                            }`}
                          >
                            {m.name}
                          </span>
                        </label>

                        {/* Granular CRUD Actions */}
                        <div
                          className={`flex items-center gap-3 text-2xs ${
                            isEnabled ? "" : "opacity-40 pointer-events-none"
                          }`}
                        >
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perm.canView}
                              onChange={() => handleToggleAction(m.key, "canView")}
                              className="rounded border-slate-300 text-slate-700"
                            />
                            <span className="text-slate-700">View</span>
                          </label>

                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perm.canCreate}
                              onChange={() => handleToggleAction(m.key, "canCreate")}
                              className="rounded border-slate-300 text-emerald-700"
                            />
                            <span className="text-slate-700">Add</span>
                          </label>

                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perm.canEdit}
                              onChange={() => handleToggleAction(m.key, "canEdit")}
                              className="rounded border-slate-300 text-blue-700"
                            />
                            <span className="text-slate-700">Edit</span>
                          </label>

                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perm.canDelete}
                              onChange={() => handleToggleAction(m.key, "canDelete")}
                              className="rounded border-slate-300 text-rose-700"
                            />
                            <span className="text-slate-700">Delete</span>
                          </label>

                          <div className="hidden md:flex items-center gap-1 pl-2 border-l border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleSetRowPreset(m.key, "FULL")}
                              className="text-[10px] text-[var(--primary)] hover:underline font-semibold"
                            >
                              Full
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleSetRowPreset(m.key, "VIEW_ONLY")}
                              className="text-[10px] text-slate-500 hover:underline"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)] shrink-0">
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
                  <span>{editingRole ? "Update Role & Rights" : "Create Role"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
