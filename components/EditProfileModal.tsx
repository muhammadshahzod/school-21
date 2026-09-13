"use client";

import { Check, Upload } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import Avatar from "./Avatar";
import Modal from "./Modal";
import { useDemo } from "./DemoProvider";
import { useLang } from "@/lib/useLang";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export default function EditProfileModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user, updateProfile } = useDemo();
  const { t } = useLang();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [skills, setSkills] = useState(user.skills.join(", "));
  const [avatar, setAvatar] = useState(user.avatar);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("editProfileModal.err_image_type"));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError(t("editProfileModal.err_image_size"));
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || submitting) return;
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
        project: user.project,
        avatar,
      });
      onSaved();
      onClose();
    } catch {
      setError(t("editProfileModal.err_save"));
      setSubmitting(false);
    }
  }
  return (
    <Modal
      title={t("editProfileModal.title")}
      description={t("editProfileModal.desc")}
      onClose={onClose}
    >
      <form className="stack-form" onSubmit={submit}>
        <div className="image-upload-row">
          <Avatar user={{ ...user, avatar }} size="lg" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="button button-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} />
            {t("editProfileModal.upload_photo")}
          </button>
        </div>
        <label className="field">
          <span>{t("editProfileModal.name_label")}</span>
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
          <span>{t("editProfileModal.bio_label")}</span>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={240}
          />
        </label>
        <label className="field">
          <span>{t("editProfileModal.skills_label")}</span>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            maxLength={160}
            aria-describedby="skills-hint"
          />
          <small id="skills-hint" className="muted">
            {t("editProfileModal.skills_hint")}
          </small>
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
            type="submit"
            className="button button-primary"
            disabled={!name.trim() || submitting}
          >
            <Check size={17} />
            {submitting ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
