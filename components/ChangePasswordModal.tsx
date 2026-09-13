"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import { changePassword } from "@/lib/api";

export default function ChangePasswordModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
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
        err instanceof Error ? err.message : "Parolni yangilashda xatolik yuz berdi.",
      );
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Parolni o‘zgartirish"
      description="Joriy parolingizni tasdiqlab, yangi parol o‘rnating."
      onClose={onClose}
    >
      <form onSubmit={submit} className="stack-form">
        <label className="field">
          <span>Joriy parol</span>
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
          <span>Yangi parol</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="kamida 4 belgi"
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
            Bekor qilish
          </button>
          <button
            className="button button-primary"
            type="submit"
            disabled={!currentPassword || newPassword.length < 4 || submitting}
          >
            <Check size={17} />
            {submitting ? "Saqlanmoqda…" : "Yangilash"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
