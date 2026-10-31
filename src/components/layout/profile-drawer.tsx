"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

export interface ProfileData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  role: string;
  email: string;
}

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSave: (updated: ProfileData, newPassword?: string) => void;
}

export function ProfileDrawer({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileDrawerProps) {
  const [formData, setFormData] = useState<ProfileData>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Sync formData whenever profile or drawer open state changes
  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      setIsEditing(false);
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage(null);
      setSuccessNotice(null);
    }
  }, [isOpen, profile]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancel edit - reset
      setFormData(profile);
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage(null);
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setSuccessNotice(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage("First Name and Last Name are required.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMessage("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage("New password and confirm password do not match.");
        return;
      }
    }

    onSave(formData, newPassword || undefined);
    setIsEditing(false);
    setNewPassword("");
    setConfirmPassword("");
    setSuccessNotice("Profile updated successfully!");

    setTimeout(() => {
      setSuccessNotice(null);
    }, 4000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-over Drawer (Right Side) */}
      <aside
        aria-label="User Profile Drawer"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header (Matches Reference Photo with Edit Button beside Close) */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)] font-bold text-sm">
              {formData.firstName?.[0] || "U"}
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Profile</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit / Cancel Toggle Button beside Close */}
            <button
              type="button"
              onClick={handleToggleEdit}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs! font-semibold transition ${
                isEditing
                  ? "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "border border-[var(--border)] bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Pencil size={12} className={isEditing ? "rotate-45" : ""} />
              <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notices */}
        {successNotice && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800 animate-in fade-in">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800 animate-in fade-in">
            <X size={14} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Status banner when in view mode */}
        {!isEditing && (
          <div className="mx-5 mt-3 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-2 text-sm text-blue-800 flex items-center justify-between">
            <span>Read-only mode. Click &apos;Edit Profile&apos; above to change details.</span>
            <Lock size={12} className="text-blue-500 shrink-0 ml-2" />
          </div>
        )}

        {/* Drawer Body - Form Fields */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* First Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium transition outline-none ${
                isEditing
                  ? "border-[var(--border)] bg-white text-slate-900 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] shadow-2xs"
                  : "border-slate-200 bg-slate-50/80 text-slate-700 cursor-not-allowed"
              }`}
              placeholder="First name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium transition outline-none ${
                isEditing
                  ? "border-[var(--border)] bg-white text-slate-900 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] shadow-2xs"
                  : "border-slate-200 bg-slate-50/80 text-slate-700 cursor-not-allowed"
              }`}
              placeholder="Last name"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Contact Number
            </label>
            <div className="relative">
              <Phone size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.contactNumber}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className={`w-full rounded-xl border pl-8 pr-3.5 py-2 text-xs font-medium transition outline-none ${
                  isEditing
                    ? "border-[var(--border)] bg-white text-slate-900 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] shadow-2xs"
                    : "border-slate-200 bg-slate-50/80 text-slate-700 cursor-not-allowed"
                }`}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          {/* Role (Readonly System Badge matching reference) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Role
            </label>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-2 text-xs font-semibold text-slate-800">
              <span className="tracking-wide uppercase font-mono">{formData.role}</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-3xs font-bold text-emerald-800">
                <ShieldCheck size={11} />
                Full Access
              </span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Email
            </label>
            <div className="relative">
              <Mail size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full rounded-xl border pl-8 pr-3.5 py-2 text-xs font-medium transition outline-none ${
                  isEditing
                    ? "border-[var(--border)] bg-white text-slate-900 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] shadow-2xs"
                    : "border-slate-200 bg-slate-50/80 text-slate-700 cursor-not-allowed"
                }`}
                placeholder="name@company.com"
              />
            </div>
          </div>

          {/* Password Section (Editable when in edit mode) */}
          {isEditing && (
            <div className="pt-3 border-t border-[var(--border-light)] space-y-3 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <KeyRound size={13} className="text-[var(--primary)]" />
                <span>Change Password (Leave blank to keep current)</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  New Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new secure password"
                    className="w-full rounded-xl border border-[var(--border)] bg-white pl-3.5 pr-8 py-2 text-sm! font-mono outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Confirm New Password:
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2 text-sm! font-mono outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* Hidden submit trigger */}
          <button type="submit" className="hidden" />
        </form>

        {/* Drawer Footer (Matches Reference Photo: Close & Save Profile) */}
        <div className="border-t border-[var(--border)] bg-slate-50/60 p-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition"
          >
            Close
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white! shadow-xs hover:bg-[var(--primary-dark)] transition"
            >
              <Check size={14} />
              <span>Save Profile</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

