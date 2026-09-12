"use client";

import { ArrowUpRight, ImagePlus, Upload, X as XIcon } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import Avatar from "./Avatar";
import Modal from "./Modal";
import { useDemo } from "./DemoProvider";
import { SKILLS } from "./types";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function CreatePostModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: () => void;
}) {
  const { user, addPost } = useDemo();
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [skill, setSkill] = useState<string>(SKILLS[0]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayllari qabul qilinadi.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Rasm hajmi 2MB dan oshmasligi kerak.");
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
        setError("Rasm uchun to‘g‘ri http:// yoki https:// havola kiriting.");
        return;
      }
    }
    setSubmitting(true);
    setError("");
    try {
      await addPost(text, skill, image.trim() || undefined);
      onCreated?.();
      onClose();
    } catch {
      setError("Post yaratishda xatolik yuz berdi. Qaytadan urinib ko‘ring.");
      setSubmitting(false);
    }
  }
  return (
    <Modal
      title="Bir fikrdan boshlanadi."
      description="G‘oya, savol yoki yangi yutuq — davrangiz bilan ulashing."
      onClose={onClose}
    >
      <form onSubmit={submit} className="stack-form">
        <div className="composer-author">
          <Avatar user={user} />
          <div>
            <strong>{user.name}</strong>
            <span className="muted small">Hamjamiyatga ochiq</span>
          </div>
        </div>
        <label className="field">
          <span>Post matni</span>
          <textarea
            autoFocus
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Bugun nimalar ustida ishlayapsiz?"
            maxLength={2000}
            required
          />
          <span className="field-counter">{text.length}/2000</span>
        </label>
        <label className="field">
          <span>
            <ImagePlus size={15} /> Rasm{" "}
            <span className="muted">(ixtiyoriy)</span>
          </span>
          <input
            type="url"
            value={image.startsWith("data:") ? "" : image}
            onChange={(e) => {
              setImage(e.target.value);
              setError("");
            }}
            placeholder="https://example.com/rasm.jpg"
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
            Fayldan yuklash
          </button>
          {image.startsWith("data:") && (
            <div className="image-upload-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Yuklangan rasm" />
              <button
                type="button"
                className="icon-button small-icon"
                aria-label="Rasmni olib tashlash"
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
          <span>Yo‘nalish</span>
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
            Bekor qilish
          </button>
          <button
            className="button button-primary"
            type="submit"
            disabled={!text.trim() || submitting}
          >
            {submitting ? "Yuborilmoqda…" : "Ulashish"}
            {!submitting && <ArrowUpRight size={17} />}
          </button>
        </div>
      </form>
    </Modal>
  );
}
