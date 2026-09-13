"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import { changePassword } from "@/lib/api";
import { useLang } from "@/lib/useLang";

export default function ChangePasswordModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLang();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!currentPassword || newPassword.length < 4 || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await changePassword(currentPassword, newPassword);
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("changePasswordModal.err_generic"),
      );
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={t("changePasswordModal.title")}
      description={t("changePasswordModal.desc")}
      onClose={onClose}
    >
      <form onSubmit={submit} className="stack-form">
        <label className="field">
          <span>{t("changePasswordModal.current_label")}</span>
          <input
            autoFocus
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label className="field">
          <span>{t("changePasswordModal.new_label")}</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t("changePasswordModal.new_placeholder")}
            autoComplete="new-password"
            required
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-footer">
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
          >
            {t("common.cancel")}
          </button>
          <button
            className="button button-primary"
            type="submit"
            disabled={!currentPassword || newPassword.length < 4 || submitting}
          >
            <Check size={17} />
            {submitting
              ? t("changePasswordModal.saving")
              : t("changePasswordModal.update")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
