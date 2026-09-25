"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Avatar } from "@/components/auth/user-avatar";
import { useAuth } from "@/components/providers/auth-provider";
import { errorMessage, uploadFile } from "@/lib/api-client";
import { compressImage } from "@/lib/image";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;
const inputClass =
  "h-12 w-full rounded-2xl bg-surface-container-low px-4 text-body-md outline-none ring-2 ring-transparent focus:ring-secondary/40";

export function EditProfileSheet({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState<{ blob: Blob; url: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function pickAvatar(file: File | undefined) {
    if (!file) return;
    try {
      const blob = await compressImage(file, 512);
      setAvatar({ blob, url: URL.createObjectURL(blob) });
    } catch {
      setError("That image couldn't be read.");
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const normalized = username.trim().toLowerCase().replace(/^@/, "");
    if (!USERNAME_RE.test(normalized)) {
      setError("Username must be 3–30 characters: a–z, 0–9 or underscore.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const avatarUrl = avatar ? (await uploadFile(avatar.blob, "avatars")).url : undefined;
      await updateProfile({
        username: normalized,
        displayName: displayName.trim(),
        bio: bio.trim(),
        ...(avatarUrl ? { avatarUrl } : {}),
      });
      onSaved();
    } catch (err) {
      setError(errorMessage(err, "Couldn't save your profile."));
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Edit profile" className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center">
      <form
        onSubmit={save}
        className="app-shell flex max-h-[92dvh] w-full flex-col gap-space-sm overflow-y-auto rounded-t-3xl bg-surface p-space-md pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] shadow-elevated sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-headline-sm font-extrabold">Edit profile</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container">
            <X size={22} />
          </button>
        </div>

        <button type="button" onClick={() => fileRef.current?.click()} className="relative mx-auto" aria-label="Change photo">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={avatar.url} alt="" className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <Avatar user={user} size={96} />
          )}
          <span className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white ring-2 ring-surface">
            <Camera size={16} />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            void pickAvatar(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <label className="flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase().slice(0, 30))}
            autoCapitalize="none"
            autoCorrect="off"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">Display name</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value.slice(0, 50))} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="flex justify-between text-label-sm text-on-surface-variant">
            Bio <span className="tabular-nums">{bio.length}/160</span>
          </span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 160))}
            rows={3}
            className="w-full resize-none rounded-2xl bg-surface-container-low p-3 text-body-md outline-none ring-2 ring-transparent focus:ring-secondary/40"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-2xl bg-error/10 px-3 py-2 text-body-sm text-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary text-label-lg text-white disabled:opacity-60"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
