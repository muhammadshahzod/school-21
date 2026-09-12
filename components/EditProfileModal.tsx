"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import { useDemo } from "./DemoProvider";

export default function EditProfileModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user, updateProfile } = useDemo();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [skills, setSkills] = useState(user.skills.join(", "));
  const [projectName, setProjectName] = useState(user.project.name);
  const [projectDescription, setProjectDescription] = useState(
    user.project.description,
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !projectName.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        skills: [
          ...new Set(
            skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          ),
        ].slice(0, 8),
        project: {
          name: projectName.trim(),
          description: projectDescription.trim(),
        },
      });
      onSaved();
      onClose();
    } catch {
      setError("Saqlashda xatolik yuz berdi. Qaytadan urinib ko‘ring.");
      setSubmitting(false);
    }
  }
  return (
    <Modal
      title="O‘zingiz haqingizda."
      description="Davrangiz sizni yanada yaxshiroq tanisin."
      onClose={onClose}
    >
      <form className="stack-form" onSubmit={submit}>
        <label className="field">
          <span>Ism va familiya</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            autoComplete="name"
          />
        </label>
        <label className="field">
          <span>Qisqacha bio</span>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={240}
          />
        </label>
        <label className="field">
          <span>Skill’lar</span>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            maxLength={160}
            aria-describedby="skills-hint"
          />
          <small id="skills-hint" className="muted">
            Vergul bilan ajrating. Masalan: Frontend, React, Python. Ko‘pi bilan
            8 ta.
          </small>
        </label>
        <label className="field">
          <span>Loyiha nomi</span>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            maxLength={80}
          />
        </label>
        <label className="field">
          <span>Loyiha tavsifi</span>
          <textarea
            rows={3}
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            maxLength={500}
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
            type="submit"
            className="button button-primary"
            disabled={!name.trim() || !projectName.trim() || submitting}
          >
            <Check size={17} />
            {submitting ? "Saqlanmoqda…" : "Saqlash"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
