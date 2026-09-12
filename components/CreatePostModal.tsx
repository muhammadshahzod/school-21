"use client";

import { ArrowUpRight, ImagePlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import Avatar from "./Avatar";
import Modal from "./Modal";
import { useDemo } from "./DemoProvider";
import { SKILLS } from "./types";

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
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    if (image.trim()) {
      try {
        if (!["http:", "https:"].includes(new URL(image.trim()).protocol))
          throw new Error();
      } catch {
        setError("Rasm uchun to‘g‘ri http:// yoki https:// havola kiriting.");
        return;
      }
    }
    addPost(text, skill, image.trim() || undefined);
    onCreated?.();
    onClose();
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
            <ImagePlus size={15} /> Rasm URL{" "}
            <span className="muted">(ixtiyoriy)</span>
          </span>
          <input
            type="url"
            value={image}
            onChange={(e) => {
              setImage(e.target.value);
              setError("");
            }}
            placeholder="https://example.com/rasm.jpg"
            aria-describedby={error ? "image-error" : undefined}
            aria-invalid={Boolean(error)}
          />
        </label>
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
            disabled={!text.trim()}
          >
            Ulashish <ArrowUpRight size={17} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
