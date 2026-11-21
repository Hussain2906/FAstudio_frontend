"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { ContactPageContent } from "@fs/cms-contracts";
import styles from "./contact-page.module.css";

type ContactField = "name" | "email" | "phone" | "projectType" | "message";
type EnquiryFields = Record<ContactField | "website", string>;
type FieldErrors = Partial<Record<ContactField, string>>;
type FormStatus = { kind: "success" | "unavailable"; message: string } | null;

type ContactEnquiryFormProps = {
  content: ContactPageContent;
  email: string;
  phone: string;
};

const EMPTY_FIELDS: EnquiryFields = {
  name: "",
  email: "",
  phone: "",
  projectType: "",
  message: "",
  website: "",
};

const CONTACT_FIELDS: readonly ContactField[] = [
  "name",
  "email",
  "phone",
  "projectType",
  "message",
];

function subscribeToHydration() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

function getFieldError(
  field: ContactField,
  values: EnquiryFields,
  projectTypes: readonly string[],
): string | undefined {
  const value = values[field].trim();

  switch (field) {
    case "name":
      if (!value) return "Enter your name.";
      if (value.length > 120) return "Use 120 characters or fewer.";
      return undefined;
    case "email":
      if (!value) return "Enter your email address.";
      if (value.length > 254) return "Use 254 characters or fewer.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Enter an email address in the format name@example.com.";
      }
      return undefined;
    case "phone":
      if (value.length > 40) return "Use 40 characters or fewer.";
      return undefined;
    case "projectType":
      if (value.length > 80) return "Use 80 characters or fewer.";
      if (value && !projectTypes.includes(value)) return "Choose one of the listed services.";
      return undefined;
    case "message":
      if (!value) return "Tell us a little about your project.";
      if (value.length > 5000) return "Use 5,000 characters or fewer.";
      return undefined;
  }
}

function validateFields(values: EnquiryFields, projectTypes: readonly string[]): FieldErrors {
  return CONTACT_FIELDS.reduce<FieldErrors>((errors, field) => {
    const error = getFieldError(field, values, projectTypes);
    if (error) errors[field] = error;
    return errors;
  }, {});
}

function fieldId(field: ContactField): string {
  return `contact-${field}`;
}

function fieldErrorId(field: ContactField): string {
  return `${fieldId(field)}-error`;
}

function toTelephoneHref(phone: string): string {
  return phone.replace(/[^+\d]/g, "");
}

export function ContactEnquiryForm({ content, email, phone }: ContactEnquiryFormProps) {
  const [values, setValues] = useState<EnquiryFields>(EMPTY_FIELDS);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitSequence, setSubmitSequence] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  );
  const [status, setStatus] = useState<FormStatus>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const errors = validateFields(values, content.projectTypes);
  const visibleErrors = CONTACT_FIELDS.reduce<FieldErrors>((result, field) => {
    if ((touched[field] || submitAttempted) && errors[field]) result[field] = errors[field];
    return result;
  }, {});
  const hasVisibleErrors = Object.keys(visibleErrors).length > 0;
  const fieldsDisabled = !isHydrated || isSending;
  const labels: Record<ContactField, string> = {
    name: content.nameLabel,
    email: content.emailLabel,
    phone: content.phoneLabel,
    projectType: content.projectTypeLabel,
    message: content.messageLabel,
  };

  useEffect(() => {
    if (submitSequence > 0 && hasVisibleErrors) errorSummaryRef.current?.focus();
  }, [hasVisibleErrors, submitSequence]);

  function updateField(field: ContactField | "website") {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setValues((current) => ({ ...current, [field]: value }));
      setStatus((current) => (current?.kind === "success" ? null : current));
    };
  }

  function blurField(field: ContactField) {
    return () => setTouched((current) => ({ ...current, [field]: true }));
  }

  function errorFor(field: ContactField): string | undefined {
    return touched[field] || submitAttempted ? errors[field] : undefined;
  }

  function describedBy(field: ContactField, helperId?: string): string | undefined {
    const ids = [helperId, errorFor(field) ? fieldErrorId(field) : undefined].filter(Boolean);
    return ids.length > 0 ? ids.join(" ") : undefined;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setSubmitSequence((current) => current + 1);
    setStatus(null);

    const nextErrors = validateFields(values, content.projectTypes);
    if (Object.keys(nextErrors).length > 0) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
    if (!baseUrl) {
      setStatus({ kind: "unavailable", message: content.unavailableMessage });
      return;
    }

    setIsSending(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(`${baseUrl}/contact/enquiries`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim() || undefined,
          projectType: values.projectType || undefined,
          message: values.message.trim(),
          website: values.website.trim(),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        setStatus({ kind: "unavailable", message: content.unavailableMessage });
        return;
      }

      setValues(EMPTY_FIELDS);
      setTouched({});
      setSubmitAttempted(false);
      setStatus({ kind: "success", message: content.successMessage });
    } catch {
      setStatus({ kind: "unavailable", message: content.unavailableMessage });
    } finally {
      window.clearTimeout(timeout);
      setIsSending(false);
    }
  }

  const emailAddress = email.trim();
  const phoneNumber = phone.trim();
  const telephoneHref = toTelephoneHref(phoneNumber);
  const orderedErrors = CONTACT_FIELDS.filter((field) => visibleErrors[field]);

  return (
    <section aria-labelledby="contact-form-heading" className={styles.formPanel}>
      <header className={styles.formHeader}>
        <p className="type-caption text-muted-foreground">Contact form</p>
        <h2 className={styles.formHeading} id="contact-form-heading">
          {content.formHeading}
        </h2>
        <p className={styles.formDescription}>{content.formDescription}</p>
      </header>

      <form
        aria-busy={fieldsDisabled}
        aria-labelledby="contact-form-heading"
        className={styles.form}
        noValidate
        onSubmit={handleSubmit}
      >
        <p className={styles.requiredNote}>Fields marked * are required.</p>

        {submitAttempted && hasVisibleErrors ? (
          <div
            aria-labelledby="contact-error-summary-heading"
            className={styles.errorSummary}
            id="contact-error-summary"
            ref={errorSummaryRef}
            role="alert"
            tabIndex={-1}
          >
            <p className={styles.errorSummaryHeading} id="contact-error-summary-heading">
              Please correct the following fields:
            </p>
            <ul className={styles.errorSummaryList}>
              {orderedErrors.map((field) => (
                <li key={field}>
                  <a href={`#${fieldId(field)}`}>
                    {labels[field]}: {visibleErrors[field]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={fieldId("name")}>
              {content.nameLabel} <span aria-hidden="true">*</span>
            </label>
            <input
              aria-describedby={describedBy("name")}
              aria-invalid={Boolean(errorFor("name"))}
              autoComplete="name"
              className={styles.control}
              disabled={fieldsDisabled}
              id={fieldId("name")}
              maxLength={120}
              name="name"
              onBlur={blurField("name")}
              onChange={updateField("name")}
              required
              type="text"
              value={values.name}
            />
            {errorFor("name") ? (
              <p className={styles.fieldError} id={fieldErrorId("name")}>
                {errorFor("name")}
              </p>
            ) : null}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={fieldId("email")}>
              {content.emailLabel} <span aria-hidden="true">*</span>
            </label>
            <input
              aria-describedby={describedBy("email")}
              aria-invalid={Boolean(errorFor("email"))}
              autoComplete="email"
              className={styles.control}
              disabled={fieldsDisabled}
              id={fieldId("email")}
              maxLength={254}
              name="email"
              onBlur={blurField("email")}
              onChange={updateField("email")}
              required
              type="email"
              value={values.email}
            />
            {errorFor("email") ? (
              <p className={styles.fieldError} id={fieldErrorId("email")}>
                {errorFor("email")}
              </p>
            ) : null}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={fieldId("phone")}>
              {content.phoneLabel}
            </label>
            <input
              aria-describedby={describedBy("phone")}
              aria-invalid={Boolean(errorFor("phone"))}
              autoComplete="tel"
              className={styles.control}
              disabled={fieldsDisabled}
              id={fieldId("phone")}
              maxLength={40}
              name="phone"
              onBlur={blurField("phone")}
              onChange={updateField("phone")}
              type="tel"
              value={values.phone}
            />
            {errorFor("phone") ? (
              <p className={styles.fieldError} id={fieldErrorId("phone")}>
                {errorFor("phone")}
              </p>
            ) : null}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={fieldId("projectType")}>
              {content.projectTypeLabel}
            </label>
            <select
              aria-describedby={describedBy("projectType")}
              aria-invalid={Boolean(errorFor("projectType"))}
              className={styles.control}
              disabled={fieldsDisabled}
              id={fieldId("projectType")}
              name="projectType"
              onBlur={blurField("projectType")}
              onChange={updateField("projectType")}
              value={values.projectType}
            >
              <option value="">Select a service (optional)</option>
              {content.projectTypes.map((projectType) => (
                <option key={projectType} value={projectType}>
                  {projectType}
                </option>
              ))}
            </select>
            {errorFor("projectType") ? (
              <p className={styles.fieldError} id={fieldErrorId("projectType")}>
                {errorFor("projectType")}
              </p>
            ) : null}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor={fieldId("message")}>
            {content.messageLabel} <span aria-hidden="true">*</span>
          </label>
          <textarea
            aria-describedby={describedBy("message", "contact-message-help")}
            aria-invalid={Boolean(errorFor("message"))}
            className={`${styles.control} ${styles.messageControl}`}
            disabled={fieldsDisabled}
            id={fieldId("message")}
            maxLength={5000}
            name="message"
            onBlur={blurField("message")}
            onChange={updateField("message")}
            required
            value={values.message}
          />
          <p className={styles.helper} id="contact-message-help">
            Maximum 5,000 characters.
          </p>
          {errorFor("message") ? (
            <p className={styles.fieldError} id={fieldErrorId("message")}>
              {errorFor("message")}
            </p>
          ) : null}
        </div>

        <div aria-hidden="true" className={styles.honeypot}>
          <label htmlFor="contact-website">Website</label>
          <input
            autoComplete="off"
            disabled={fieldsDisabled}
            id="contact-website"
            name="website"
            onChange={updateField("website")}
            tabIndex={-1}
            value={values.website}
          />
        </div>

        <div className={styles.submitRow}>
          <button className={styles.submitButton} disabled={fieldsDisabled} type="submit">
            {isSending ? (
              <>
                <span aria-hidden="true" className={styles.spinner} />
                Sending…
              </>
            ) : (
              content.submitLabel
            )}
          </button>
        </div>

        {status ? (
          <div
            aria-atomic="true"
            className={`${styles.status} ${status.kind === "unavailable" ? styles.statusError : styles.statusSuccess}`}
            role="status"
          >
            <p>{status.message}</p>
            {status.kind === "unavailable" ? (
              emailAddress || telephoneHref ? (
                <>
                  <p className={styles.recoveryIntro}>Or contact the Studio directly:</p>
                  <div className={styles.recoveryLinks}>
                    {emailAddress ? <a href={`mailto:${emailAddress}`}>Email the Studio</a> : null}
                    {telephoneHref ? <a href={`tel:${telephoneHref}`}>Call the Studio</a> : null}
                  </div>
                </>
              ) : (
                <p className={styles.recoveryIntro}>
                  Contact details could not be loaded. Please reconnect and try again.
                </p>
              )
            ) : null}
          </div>
        ) : null}
      </form>
    </section>
  );
}
