"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Save,
  User,
  Users,
} from "lucide-react";
import type {
  Supplier,
  SupplierPaymentTerms,
  SupplierStatus,
  SupplierType,
} from "./supplier.types";

interface SupplierFormProps {
  mode: "create" | "edit";
  supplier?: Supplier;
}

const paymentTermOptions: SupplierPaymentTerms[] = [
  "Due on Receipt",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
  "Advance Payment",
];

export function SupplierForm({ mode, supplier }: SupplierFormProps) {
  const isEdit = mode === "edit";

  // Section 1: Supplier Information
  const [supplierType, setSupplierType] = useState<SupplierType>(
    supplier?.supplierType ?? "BUSINESS",
  );
  const [supplierCode, setSupplierCode] = useState(
    supplier?.supplierCode ?? "",
  );
  const [companyName, setCompanyName] = useState(
    supplier?.companyName ?? "",
  );
  const [contactPerson, setContactPerson] = useState(
    supplier?.contactPerson ?? "",
  );

  // Section 2: Contact Details
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [alternatePhone, setAlternatePhone] = useState(
    supplier?.alternatePhone ?? "",
  );
  const [taxId, setTaxId] = useState(supplier?.taxId ?? "");

  // Section 3: Address
  const [addressLine1, setAddressLine1] = useState(
    supplier?.addressLine1 ?? "",
  );
  const [addressLine2, setAddressLine2] = useState(
    supplier?.addressLine2 ?? "",
  );
  const [city, setCity] = useState(supplier?.city ?? "");
  const [state, setState] = useState(supplier?.state ?? "");
  const [postalCode, setPostalCode] = useState(
    supplier?.postalCode ?? "",
  );
  const [country, setCountry] = useState(
    supplier?.country ?? "United States",
  );

  // Section 4: Payment & Tax
  const [paymentTerms, setPaymentTerms] = useState<SupplierPaymentTerms>(
    supplier?.paymentTerms ?? "Net 30",
  );
  const [openingBalance, setOpeningBalance] = useState(
    supplier?.openingBalance !== undefined ? String(supplier.openingBalance) : "0",
  );
  const [status, setStatus] = useState<SupplierStatus>(
    supplier?.status ?? "ACTIVE",
  );

  // Section 5: Notes
  const [notes, setNotes] = useState(supplier?.notes ?? "");

  // Feedback & validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!supplierCode.trim()) {
      newErrors.supplierCode = "Supplier code is required.";
    } else if (supplierCode.trim().length < 3) {
      newErrors.supplierCode = "Supplier code must be at least 3 characters.";
    }

    if (supplierType === "BUSINESS" && !companyName.trim()) {
      newErrors.companyName = "Company name is required for business suppliers.";
    }

    if (!contactPerson.trim()) {
      newErrors.contactPerson = "Primary contact person is required.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required.";
    }
    if (!city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!state.trim()) {
      newErrors.state = "State is required.";
    }
    if (!postalCode.trim()) {
      newErrors.postalCode = "Postal code is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setFeedbackMessage("");
      return;
    }

    const payload = {
      supplierCode: supplierCode.trim(),
      supplierType,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      alternatePhone: alternatePhone.trim(),
      taxId: taxId.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      paymentTerms,
      openingBalance: Number(openingBalance) || 0,
      status,
      notes: notes.trim(),
    };

    console.log(
      isEdit ? "Updated supplier payload:" : "Created supplier payload:",
      payload,
    );

    setFeedbackMessage(
      isEdit
        ? "Supplier details validated successfully. Note: Backend API persistence is pending implementation."
        : "Supplier created and validated successfully. Note: Backend API persistence is pending implementation.",
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/suppliers"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
            aria-label="Back to suppliers"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit Supplier" : "Add Supplier"}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isEdit
                ? `Update procurement and account information for ${supplier?.companyName || supplier?.contactPerson}.`
                : "Register a new manufacturer, artisan, or vendor for purchasing."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/suppliers"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="supplier-form"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {isEdit ? "Save Changes" : "Save Supplier"}
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {feedbackMessage}
        </div>
      )}

      <form id="supplier-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Supplier Information */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Supplier Information</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                General company identity, supplier classification, and contact lead.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Supplier Type <span className="text-[var(--danger)]">*</span>
              </label>
              <div className="flex gap-4 pt-1">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="supplierType"
                    value="BUSINESS"
                    checked={supplierType === "BUSINESS"}
                    onChange={() => setSupplierType("BUSINESS")}
                    className="h-4 w-4 text-[var(--primary)] accent-[var(--primary)]"
                  />
                  <span>Business / Corporation</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="supplierType"
                    value="INDIVIDUAL"
                    checked={supplierType === "INDIVIDUAL"}
                    onChange={() => setSupplierType("INDIVIDUAL")}
                    className="h-4 w-4 text-[var(--primary)] accent-[var(--primary)]"
                  />
                  <span>Individual / Artisan</span>
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="supplier-code">
                Supplier Code <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="supplier-code"
                className="form-input uppercase"
                value={supplierCode}
                onChange={(e) => {
                  setSupplierCode(e.target.value.toUpperCase().replace(/\s/g, ""));
                  if (errors.supplierCode) {
                    setErrors((prev) => ({ ...prev, supplierCode: "" }));
                  }
                }}
                placeholder="e.g. SUP-001"
                maxLength={20}
                required
              />
              {errors.supplierCode && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {errors.supplierCode}
                </p>
              )}
            </div>

            {supplierType === "BUSINESS" && (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium" htmlFor="company-name">
                  Company Name <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  id="company-name"
                  className="form-input"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (errors.companyName) {
                      setErrors((prev) => ({ ...prev, companyName: "" }));
                    }
                  }}
                  placeholder="e.g. Appalachian Hardwood Mills"
                  required
                />
                {errors.companyName && (
                  <p className="mt-1 text-xs text-[var(--danger)]">
                    {errors.companyName}
                  </p>
                )}
              </div>
            )}

            <div className={supplierType === "INDIVIDUAL" ? "sm:col-span-2" : ""}>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="contact-person">
                Contact Person <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="contact-person"
                className="form-input"
                value={contactPerson}
                onChange={(e) => {
                  setContactPerson(e.target.value);
                  if (errors.contactPerson) {
                    setErrors((prev) => ({ ...prev, contactPerson: "" }));
                  }
                }}
                placeholder="e.g. Robert Sterling"
                required
              />
              {errors.contactPerson && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {errors.contactPerson}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Contact Details */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Contact Details</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Email communications, phone numbers, and tax identification.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                placeholder="e.g. orders@supplier.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="phone">
                Phone Number <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                placeholder="e.g. (828) 555-0182"
                required
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="alt-phone">
                Alternate Phone
              </label>
              <input
                id="alt-phone"
                type="tel"
                className="form-input"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                placeholder="e.g. (828) 555-0183"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="tax-id">
                Tax ID / EIN
              </label>
              <input
                id="tax-id"
                className="form-input"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="e.g. 56-8941235"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Address */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Supplier Facility / Dispatch Address</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Physical warehouse or factory origin address.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium" htmlFor="address-1">
                Address Line 1 <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="address-1"
                className="form-input"
                value={addressLine1}
                onChange={(e) => {
                  setAddressLine1(e.target.value);
                  if (errors.addressLine1) {
                    setErrors((prev) => ({ ...prev, addressLine1: "" }));
                  }
                }}
                placeholder="Street address or industrial park"
                required
              />
              {errors.addressLine1 && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {errors.addressLine1}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium" htmlFor="address-2">
                Address Line 2
              </label>
              <input
                id="address-2"
                className="form-input"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Building, unit, or dock number"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="city">
                City <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="city"
                className="form-input"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) {
                    setErrors((prev) => ({ ...prev, city: "" }));
                  }
                }}
                placeholder="City"
                required
              />
              {errors.city && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {errors.city}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="state">
                  State <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  id="state"
                  className="form-input uppercase"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    if (errors.state) {
                      setErrors((prev) => ({ ...prev, state: "" }));
                    }
                  }}
                  placeholder="e.g. NC"
                  required
                />
                {errors.state && (
                  <p className="mt-1 text-xs text-[var(--danger)]">
                    {errors.state}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="postal-code">
                  Postal Code <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  id="postal-code"
                  className="form-input"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    if (errors.postalCode) {
                      setErrors((prev) => ({ ...prev, postalCode: "" }));
                    }
                  }}
                  placeholder="e.g. 28801"
                  required
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-[var(--danger)]">
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium" htmlFor="country">
                Country <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="country"
                className="form-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United States"
                required
              />
            </div>
          </div>
        </section>

        {/* Section 4: Payment & Tax */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <CreditCard size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Payment Terms & Status</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Agreed purchasing payment terms, opening balance, and vendor status.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="payment-terms">
                Payment Terms <span className="text-[var(--danger)]">*</span>
              </label>
              <select
                id="payment-terms"
                className="form-input"
                value={paymentTerms}
                onChange={(e) =>
                  setPaymentTerms(e.target.value as SupplierPaymentTerms)
                }
              >
                {paymentTermOptions.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="opening-balance">
                Opening Balance (USD)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                  $
                </span>
                <input
                  id="opening-balance"
                  type="number"
                  step="0.01"
                  className="form-input pl-7"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="status">
                Status <span className="text-[var(--danger)]">*</span>
              </label>
              <select
                id="status"
                className="form-input"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as SupplierStatus)
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 5: Notes */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Purchasing Notes</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Special order instructions, minimum order quantities (MOQ), or material specs.
              </p>
            </div>
          </div>

          <div className="p-5">
            <textarea
              className="min-h-[100px] w-full resize-y rounded-[10px] border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lead time 3 weeks, custom milling requires signed cutting ticket..."
              maxLength={1000}
            />
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2 rounded-xl border border-[var(--border)] bg-white p-4">
          <Link
            href="/suppliers"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {isEdit ? "Save Changes" : "Save Supplier"}
          </button>
        </div>
      </form>
    </div>
  );
}
