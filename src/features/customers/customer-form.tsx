"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Save,
  Truck,
  User,
  Users,
} from "lucide-react";
import type {
  Address,
  Customer,
  CustomerStatus,
  CustomerType,
  PaymentTerms,
} from "./customer.types";

interface CustomerFormProps {
  mode: "create" | "edit";
  customer?: Customer;
}

const paymentTermOptions: PaymentTerms[] = [
  "Due on Receipt",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
];

const emptyAddress: Address = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
};

export function CustomerForm({ mode, customer }: CustomerFormProps) {
  const isEdit = mode === "edit";

  // Section A: Basic Info
  const [customerType, setCustomerType] = useState<CustomerType>(
    customer?.customerType ?? "INDIVIDUAL",
  );
  const [customerCode, setCustomerCode] = useState(
    customer?.customerCode ?? "",
  );
  const [firstName, setFirstName] = useState(customer?.firstName ?? "");
  const [lastName, setLastName] = useState(customer?.lastName ?? "");
  const [companyName, setCompanyName] = useState(
    customer?.companyName ?? "",
  );
  const [displayName, setDisplayName] = useState(
    customer?.displayName ?? "",
  );
  const [isDisplayNameTouched, setIsDisplayNameTouched] = useState(
    Boolean(customer?.displayName),
  );

  // Section B: Contact Info
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [alternatePhone, setAlternatePhone] = useState(
    customer?.alternatePhone ?? "",
  );
  const [taxId, setTaxId] = useState(customer?.taxId ?? "");

  // Section C: Billing Address
  const [billingAddress, setBillingAddress] = useState<Address>(
    customer?.billingAddress ?? { ...emptyAddress },
  );

  // Section D: Shipping Address
  const initialSameAddress = customer
    ? JSON.stringify(customer.billingAddress) ===
      JSON.stringify(customer.shippingAddress)
    : true;

  const [sameAsBilling, setSameAsBilling] = useState<boolean>(
    initialSameAddress,
  );
  const [shippingAddress, setShippingAddress] = useState<Address>(
    customer?.shippingAddress ?? { ...emptyAddress },
  );

  // Section E: Payment & Account
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>(
    customer?.paymentTerms ?? "Due on Receipt",
  );
  const [creditLimit, setCreditLimit] = useState(
    customer?.creditLimit !== undefined
      ? String(customer.creditLimit)
      : "0",
  );
  const [status, setStatus] = useState<CustomerStatus>(
    customer?.status ?? "ACTIVE",
  );

  // Section F: Notes
  const [notes, setNotes] = useState(customer?.notes ?? "");

  // Form feedback state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Auto-sync display name when untouched
  const handleFirstNameChange = (val: string) => {
    setFirstName(val);
    if (!isDisplayNameTouched && customerType === "INDIVIDUAL") {
      setDisplayName(`${val} ${lastName}`.trim());
    }
  };

  const handleLastNameChange = (val: string) => {
    setLastName(val);
    if (!isDisplayNameTouched && customerType === "INDIVIDUAL") {
      setDisplayName(`${firstName} ${val}`.trim());
    }
  };

  const handleCompanyNameChange = (val: string) => {
    setCompanyName(val);
    if (!isDisplayNameTouched && customerType === "BUSINESS") {
      setDisplayName(val);
    }
  };

  const handleCustomerTypeChange = (type: CustomerType) => {
    setCustomerType(type);
    if (!isDisplayNameTouched) {
      if (type === "BUSINESS") {
        setDisplayName(companyName);
      } else {
        setDisplayName(`${firstName} ${lastName}`.trim());
      }
    }
  };

  // Address update helpers
  const updateBillingAddress = (
    field: keyof Address,
    value: string,
  ) => {
    const updated = { ...billingAddress, [field]: value };
    setBillingAddress(updated);
    if (sameAsBilling) {
      setShippingAddress(updated);
    }
  };

  const updateShippingAddress = (
    field: keyof Address,
    value: string,
  ) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSameAsBillingToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsBilling(checked);
    if (checked) {
      setShippingAddress({ ...billingAddress });
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerCode.trim()) {
      newErrors.customerCode = "Customer code is required.";
    } else if (customerCode.trim().length < 3) {
      newErrors.customerCode = "Customer code must be at least 3 characters.";
    }

    if (customerType === "BUSINESS" && !companyName.trim()) {
      newErrors.companyName = "Company name is required for business accounts.";
    }

    if (!displayName.trim()) {
      newErrors.displayName = "Display name is required.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Primary phone number is required.";
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    // Billing address required fields
    if (!billingAddress.addressLine1.trim()) {
      newErrors.billingAddressLine1 = "Billing address line 1 is required.";
    }
    if (!billingAddress.city.trim()) {
      newErrors.billingCity = "Billing city is required.";
    }
    if (!billingAddress.state.trim()) {
      newErrors.billingState = "Billing state is required.";
    }
    if (!billingAddress.postalCode.trim()) {
      newErrors.billingPostalCode = "Billing postal code is required.";
    }

    // Shipping address validation if not identical
    if (!sameAsBilling) {
      if (!shippingAddress.addressLine1.trim()) {
        newErrors.shippingAddressLine1 = "Shipping address line 1 is required.";
      }
      if (!shippingAddress.city.trim()) {
        newErrors.shippingCity = "Shipping city is required.";
      }
      if (!shippingAddress.state.trim()) {
        newErrors.shippingState = "Shipping state is required.";
      }
      if (!shippingAddress.postalCode.trim()) {
        newErrors.shippingPostalCode = "Shipping postal code is required.";
      }
    }

    const numCredit = Number(creditLimit);
    if (isNaN(numCredit) || numCredit < 0) {
      newErrors.creditLimit = "Credit limit must be a valid non-negative number.";
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

    const formData = {
      customerCode: customerCode.trim(),
      customerType,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      companyName: companyName.trim(),
      displayName: displayName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      alternatePhone: alternatePhone.trim(),
      taxId: taxId.trim(),
      paymentTerms,
      creditLimit: Number(creditLimit) || 0,
      billingAddress,
      shippingAddress: sameAsBilling ? billingAddress : shippingAddress,
      notes: notes.trim(),
      status,
    };

    console.log(
      isEdit ? "Updated customer payload:" : "Created customer payload:",
      formData,
    );

    setFeedbackMessage(
      isEdit
        ? "Customer details validated successfully. Note: Backend API persistence is pending implementation."
        : "Customer form validated successfully. Note: Backend API persistence is pending implementation.",
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/customers"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
            aria-label="Back to customers"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit Customer" : "Add Customer"}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isEdit
                ? `Update details and address preferences for ${customer?.displayName || "this customer"}.`
                : "Create a new customer profile for billing, sales, and delivery."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/customers"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="customer-form"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {isEdit ? "Save Changes" : "Save Customer"}
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

      <form id="customer-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section A: Basic Information */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Basic Information</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Customer identity, classification, and primary display name.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Customer Type <span className="text-[var(--danger)]">*</span>
              </label>
              <div className="flex gap-4 pt-1">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="customerType"
                    value="INDIVIDUAL"
                    checked={customerType === "INDIVIDUAL"}
                    onChange={() => handleCustomerTypeChange("INDIVIDUAL")}
                    className="h-4 w-4 text-[var(--primary)] accent-[var(--primary)]"
                  />
                  <span>Individual</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="customerType"
                    value="BUSINESS"
                    checked={customerType === "BUSINESS"}
                    onChange={() => handleCustomerTypeChange("BUSINESS")}
                    className="h-4 w-4 text-[var(--primary)] accent-[var(--primary)]"
                  />
                  <span>Business</span>
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="customer-code">
                Customer Code <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="customer-code"
                className="form-input uppercase"
                value={customerCode}
                onChange={(e) => {
                  setCustomerCode(
                    e.target.value.toUpperCase().replace(/\s/g, ""),
                  );
                  if (errors.customerCode) {
                    setErrors((prev) => ({ ...prev, customerCode: "" }));
                  }
                }}
                placeholder="e.g. CUS-0001"
                maxLength={20}
                required
              />
              {errors.customerCode && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {errors.customerCode}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="first-name">
                First Name {customerType === "INDIVIDUAL" && <span className="text-[var(--danger)]">*</span>}
              </label>
              <input
                id="first-name"
                className="form-input"
                value={firstName}
                onChange={(e) => handleFirstNameChange(e.target.value)}
                placeholder="e.g. Eleanor"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="last-name">
                Last Name {customerType === "INDIVIDUAL" && <span className="text-[var(--danger)]">*</span>}
              </label>
              <input
                id="last-name"
                className="form-input"
                value={lastName}
                onChange={(e) => handleLastNameChange(e.target.value)}
                placeholder="e.g. Vance"
              />
            </div>

            {customerType === "BUSINESS" && (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium" htmlFor="company-name">
                  Company Name <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  id="company-name"
                  className="form-input"
                  value={companyName}
                  onChange={(e) => {
                    handleCompanyNameChange(e.target.value);
                    if (errors.companyName) {
                      setErrors((prev) => ({ ...prev, companyName: "" }));
                    }
                  }}
                  placeholder="e.g. Vance Interior Design Studio"
                  required
                />
                {errors.companyName && (
                  <p className="mt-1 text-xs text-[var(--danger)]">
                    {errors.companyName}
                  </p>
                )}
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium" htmlFor="display-name">
                Display Name <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="display-name"
                className="form-input"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setIsDisplayNameTouched(true);
                  if (errors.displayName) {
                    setErrors((prev) => ({ ...prev, displayName: "" }));
                  }
                }}
                placeholder="Name used on invoices and order summaries"
                required
              />
              {errors.displayName && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {errors.displayName}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section B: Contact Information */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Contact Information</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Email, telephone numbers, and tax identification details.
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
                placeholder="e.g. contact@example.com"
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
                placeholder="e.g. (212) 555-0198"
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
                placeholder="e.g. (212) 555-0199"
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
                placeholder="e.g. 12-3456789"
              />
            </div>
          </div>
        </section>

        {/* Section C: Billing Address */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Billing Address</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Address appearing on official invoices and statements.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium" htmlFor="billing-line1">
                Address Line 1 <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="billing-line1"
                className="form-input"
                value={billingAddress.addressLine1}
                onChange={(e) =>
                  updateBillingAddress("addressLine1", e.target.value)
                }
                placeholder="Street address or P.O. Box"
                required
              />
              {errors.billingAddressLine1 && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {errors.billingAddressLine1}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium" htmlFor="billing-line2">
                Address Line 2
              </label>
              <input
                id="billing-line2"
                className="form-input"
                value={billingAddress.addressLine2 || ""}
                onChange={(e) =>
                  updateBillingAddress("addressLine2", e.target.value)
                }
                placeholder="Apartment, suite, unit, or floor"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="billing-city">
                City <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="billing-city"
                className="form-input"
                value={billingAddress.city}
                onChange={(e) => updateBillingAddress("city", e.target.value)}
                placeholder="City"
                required
              />
              {errors.billingCity && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {errors.billingCity}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="billing-state">
                  State <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  id="billing-state"
                  className="form-input uppercase"
                  value={billingAddress.state}
                  onChange={(e) => updateBillingAddress("state", e.target.value)}
                  placeholder="e.g. NY"
                  maxLength={50}
                  required
                />
                {errors.billingState && (
                  <p className="mt-1 text-xs text-[var(--danger)]">
                    {errors.billingState}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="billing-zip">
                  Postal Code <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  id="billing-zip"
                  className="form-input"
                  value={billingAddress.postalCode}
                  onChange={(e) =>
                    updateBillingAddress("postalCode", e.target.value)
                  }
                  placeholder="e.g. 10017"
                  maxLength={12}
                  required
                />
                {errors.billingPostalCode && (
                  <p className="mt-1 text-xs text-[var(--danger)]">
                    {errors.billingPostalCode}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium" htmlFor="billing-country">
                Country <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="billing-country"
                className="form-input"
                value={billingAddress.country}
                onChange={(e) => updateBillingAddress("country", e.target.value)}
                placeholder="United States"
                required
              />
            </div>
          </div>
        </section>

        {/* Section D: Shipping Address */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[var(--primary)]">
                <Truck size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Shipping Address</h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Primary delivery address for furniture and merchandise shipments.
                </p>
              </div>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={sameAsBilling}
                onChange={handleSameAsBillingToggle}
                className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] accent-[var(--primary)]"
              />
              <span>Shipping address same as billing address</span>
            </label>
          </div>

          {!sameAsBilling ? (
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium" htmlFor="shipping-line1">
                  Address Line 1 <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  id="shipping-line1"
                  className="form-input"
                  value={shippingAddress.addressLine1}
                  onChange={(e) =>
                    updateShippingAddress("addressLine1", e.target.value)
                  }
                  placeholder="Street address or delivery gate"
                  required
                />
                {errors.shippingAddressLine1 && (
                  <p className="mt-1 text-xs text-[var(--danger)]">
                    {errors.shippingAddressLine1}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium" htmlFor="shipping-line2">
                  Address Line 2
                </label>
                <input
                  id="shipping-line2"
                  className="form-input"
                  value={shippingAddress.addressLine2 || ""}
                  onChange={(e) =>
                    updateShippingAddress("addressLine2", e.target.value)
                  }
                  placeholder="Suite, unit, receiving dock, or floor"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="shipping-city">
                  City <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  id="shipping-city"
                  className="form-input"
                  value={shippingAddress.city}
                  onChange={(e) =>
                    updateShippingAddress("city", e.target.value)
                  }
                  placeholder="City"
                  required
                />
                {errors.shippingCity && (
                  <p className="mt-1 text-xs text-[var(--danger)]">
                    {errors.shippingCity}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="shipping-state">
                    State <span className="text-[var(--danger)]">*</span>
                  </label>
                  <input
                    id="shipping-state"
                    className="form-input uppercase"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      updateShippingAddress("state", e.target.value)
                    }
                    placeholder="e.g. CA"
                    maxLength={50}
                    required
                  />
                  {errors.shippingState && (
                    <p className="mt-1 text-xs text-[var(--danger)]">
                      {errors.shippingState}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="shipping-zip">
                    Postal Code <span className="text-[var(--danger)]">*</span>
                  </label>
                  <input
                    id="shipping-zip"
                    className="form-input"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      updateShippingAddress("postalCode", e.target.value)
                    }
                    placeholder="e.g. 94102"
                    maxLength={12}
                    required
                  />
                  {errors.shippingPostalCode && (
                    <p className="mt-1 text-xs text-[var(--danger)]">
                      {errors.shippingPostalCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium" htmlFor="shipping-country">
                  Country <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  id="shipping-country"
                  className="form-input"
                  value={shippingAddress.country}
                  onChange={(e) =>
                    updateShippingAddress("country", e.target.value)
                  }
                  placeholder="United States"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="p-5 text-sm text-[var(--muted)]">
              <p>
                Shipping address is currently set identical to billing address:
              </p>
              <p className="mt-1 font-medium text-[var(--foreground)]">
                {billingAddress.addressLine1
                  ? `${billingAddress.addressLine1}${
                      billingAddress.addressLine2
                        ? `, ${billingAddress.addressLine2}`
                        : ""
                    }, ${billingAddress.city || ""}, ${
                      billingAddress.state || ""
                    } ${billingAddress.postalCode || ""}`
                  : "Same address as entered in Billing Address."}
              </p>
            </div>
          )}
        </section>

        {/* Section E: Payment & Account */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <CreditCard size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Payment & Account Terms</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Invoicing payment window, assigned credit limit, and account status.
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
                onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
              >
                {paymentTermOptions.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="credit-limit">
                Credit Limit (USD)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                  $
                </span>
                <input
                  id="credit-limit"
                  type="number"
                  min="0"
                  step="100"
                  className="form-input pl-7"
                  value={creditLimit}
                  onChange={(e) => {
                    setCreditLimit(e.target.value);
                    if (errors.creditLimit) {
                      setErrors((prev) => ({ ...prev, creditLimit: "" }));
                    }
                  }}
                  placeholder="0.00"
                />
              </div>
              {errors.creditLimit && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {errors.creditLimit}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="customer-status">
                Account Status <span className="text-[var(--danger)]">*</span>
              </label>
              <select
                id="customer-status"
                className="form-input"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as CustomerStatus)
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section F: Notes */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Internal Notes</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Special shipping directions, designer trade notes, or internal instructions.
              </p>
            </div>
          </div>

          <div className="p-5">
            <textarea
              className="min-h-[100px] w-full resize-y rounded-[10px] border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Delivery requires elevator reservation or trade discount notes..."
              maxLength={1000}
            />
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2 rounded-xl border border-[var(--border)] bg-white p-4">
          <Link
            href="/customers"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {isEdit ? "Save Changes" : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}
