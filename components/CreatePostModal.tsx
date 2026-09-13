"use client";

import { ArrowUpRight, ImagePlus, Upload, X as XIcon } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import Avatar from "./Avatar";
import Modal from "./Modal";
import { useDemo } from "./DemoProvider";
import { useLang } from "@/lib/useLang";
import { SKILLS, type Post } from "./types";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function CreatePostModal({
  onClose,
  onCreated,
  editing,
}: {
  onClose: () => void;
  onCreated?: () => void;
  editing?: Post;
}) {
  const { user, addPost, editPost } = useDemo();
  const { t } = useLang();
  const [text, setText] = useState(editing?.text ?? "");
  const [image, setImage] = useState(editing?.image ?? "");
  const [skill, setSkill] = useState<string>(editing?.skill ?? SKILLS[0]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("createPostModal.err_image_type"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("createPostModal.err_image_size"));
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || submitting) return;
    if (image.trim() && !image.startsWith("data:")) {
      try {
        if (!["http:", "https:"].includes(new URL(image.trim()).protocol))
          throw new Error();
      } catch {
        setError(t("createPostModal.err_invalid_url"));
        return;
      }
    }
    setSubmitting(true);
    setError("");
    try {
      if (editing) {
        await editPost(editing.id, text, skill, image.trim() || undefined);
      } else {
        await addPost(text, skill, image.trim() || undefined);
      }
      onCreated?.();
      onClose();
    } catch {
      setError(
        editing ? t("createPostModal.err_update") : t("createPostModal.err_create"),
      );
      setSubmitting(false);
    }
  }
  return (
    <Modal
      title={editing ? t("createPostModal.edit_title") : t("createPostModal.new_title")}
      description={
        editing ? t("createPostModal.edit_desc") : t("createPostModal.new_desc")
      }
      onClose={onClose}
    >
      <form onSubmit={submit} className="stack-form">
        <div className="composer-author">
          <Avatar user={user} />
          <div>
            <strong>{user.name}</strong>
            <span className="muted small">{t("createPostModal.public_note")}</span>
          </div>
        </div>
        <label className="field">
          <span>{t("createPostModal.text_label")}</span>
          <textarea
            autoFocus
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("createPostModal.text_placeholder")}
            maxLength={2000}
            required
          />
          <span className="field-counter">{text.length}/2000</span>
        </label>
        <label className="field">
          <span>
            <ImagePlus size={15} /> {t("createPostModal.image_label")}{" "}
            <span className="muted">{t("createPostModal.optional")}</span>
          </span>
          <input
            type="url"
            value={image.startsWith("data:") ? "" : image}
            onChange={(e) => {
              setImage(e.target.value);
              setError("");
            }}
            placeholder={t("createPostModal.image_placeholder")}
            disabled={image.startsWith("data:")}
            aria-describedby={error ? "image-error" : undefined}
            aria-invalid={Boolean(error)}
          />
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="image-upload-row">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} />
            {t("createPostModal.upload_from_file")}
          </button>
          {image.startsWith("data:") && (
            <div className="image-upload-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={t("createPostModal.uploaded_image_alt")} />
              <button
                type="button"
                className="icon-button small-icon"
                aria-label={t("createPostModal.remove_image")}
                onClick={() => {
                  setImage("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                <XIcon size={16} />
              </button>
            </div>
          )}
        </div>
        {error && (
          <p id="image-error" className="form-error" role="alert">
            {error}
          </p>
        )}
        <label className="field">
          <span>{t("createPostModal.direction_label")}</span>
          <select value={skill} onChange={(e) => setSkill(e.target.value)}>
            {SKILLS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
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
            disabled={!text.trim() || submitting}
          >
            {submitting
              ? t("createPostModal.saving")
              : editing
                ? t("createPostModal.update")
                : t("createPostModal.share")}
            {!submitting && <ArrowUpRight size={17} />}
          </button>
        </div>
      </form>
    </Modal>
  );
}
