"use client";

import { ArrowUpRight, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import Avatar from "./Avatar";
import Modal from "./Modal";
import { useDemo } from "./DemoProvider";

export default function GroupCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: (conversationId: string) => void;
}) {
  const { peers, createGroup } = useDemo();
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
      setError("Guruh yaratishda xatolik yuz berdi.");
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Yangi guruh"
      description="Bir nechta pir bilan birga suhbat oching."
      onClose={onClose}
    >
      <form onSubmit={submit} className="stack-form">
        <label className="field">
          <span>Guruh nomi</span>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Frontend jamoasi"
            maxLength={60}
            required
          />
        </label>
        <fieldset className="field group-fieldset">
          <legend>
            <Users size={15} /> A’zolarni tanlang
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
            <p className="muted small">Hozircha pirlar topilmadi.</p>
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
            Bekor qilish
          </button>
          <button
            className="button button-primary"
            type="submit"
            disabled={!name.trim() || selected.length === 0 || submitting}
          >
            {submitting ? "Ochilmoqda…" : "Guruh ochish"}
            {!submitting && <ArrowUpRight size={17} />}
          </button>
        </div>
      </form>
    </Modal>
  );
}
