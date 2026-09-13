"use client";

import { ArrowUpRight, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import Avatar from "./Avatar";
import Modal from "./Modal";
import { useDemo } from "./DemoProvider";
import { useLang } from "@/lib/useLang";

export default function GroupCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: (conversationId: string) => void;
}) {
  const { peers, createGroup } = useDemo();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || selected.length === 0 || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const id = await createGroup(name, selected);
      onCreated?.(id);
      onClose();
    } catch {
      setError(t("groupCreateModal.err"));
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={t("groupCreateModal.title")}
      description={t("groupCreateModal.desc")}
      onClose={onClose}
    >
      <form onSubmit={submit} className="stack-form">
        <label className="field">
          <span>{t("groupCreateModal.name_label")}</span>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("groupCreateModal.name_placeholder")}
            maxLength={60}
            required
          />
        </label>
        <fieldset className="field group-fieldset">
          <legend>
            <Users size={15} /> {t("groupCreateModal.members_legend")}
          </legend>
          <div className="group-member-list">
            {peers.map((peer) => (
              <label key={peer.id} className="group-member-option">
                <input
                  type="checkbox"
                  checked={selected.includes(peer.id)}
                  onChange={() => toggle(peer.id)}
                />
                <Avatar user={peer} size="sm" />
                <span>{peer.name}</span>
              </label>
            ))}
          </div>
          {peers.length === 0 && (
            <p className="muted small">{t("groupCreateModal.no_peers")}</p>
          )}
        </fieldset>
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
            disabled={!name.trim() || selected.length === 0 || submitting}
          >
            {submitting
              ? t("groupCreateModal.submitting")
              : t("groupCreateModal.submit")}
            {!submitting && <ArrowUpRight size={17} />}
          </button>
        </div>
      </form>
    </Modal>
  );
}
