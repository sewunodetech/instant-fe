"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Pencil, Plus, Wallet } from "lucide-react";
import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";
import { ProfileSkeleton, ProfileView } from "@/components/profile/profile-view";
import { headerIconButton, ScreenHeader } from "@/components/layout/screen-header";
import { useAuth } from "@/components/providers/auth-provider";
import { ErrorState } from "@/components/ui/state";
import { getProfile } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";

export default function MyProfilePage() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const profile = useApi(user ? () => getProfile(user.id) : null, [user?.id]);

  const header = (
    <ScreenHeader
      title="Profile"
      actions={
        <>
          <Link href="/wallet" aria-label="Wallet" className={headerIconButton}>
            <Wallet size={20} />
          </Link>
          <button type="button" aria-label="Edit profile" onClick={() => setEditing(true)} className={headerIconButton}>
            <Pencil size={18} />
          </button>
        </>
      }
    />
  );

  if (!profile.data) {
    return (
      <>
        {header}
        {profile.error ? (
          <div className="px-4 pt-2">
            <ErrorState message={profile.error} onRetry={profile.reload} />
          </div>
        ) : (
          <ProfileSkeleton />
        )}
      </>
    );
  }

  return (
    <>
      {header}
      <ProfileView
        profile={{ ...profile.data, ...(user ?? {}), stats: profile.data.stats }}
        isMe
        actions={
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-surface-container text-label-md transition-transform active:scale-95"
            >
              <Pencil size={16} />
              Edit profile
            </button>
            <Link
              href="/create"
              className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-secondary-container text-label-md font-bold text-on-secondary transition-transform active:scale-95"
            >
              <Plus size={16} />
              Host campaign
            </Link>
          </div>
        }
      />
      <div className="px-4 pt-6">
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Log out of instant.fun?")) void logout();
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-error/15 text-label-md text-error transition-colors active:bg-error/10"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
      {editing && (
        <EditProfileSheet
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            void profile.reload();
          }}
        />
      )}
    </>
  );
}
