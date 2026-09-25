"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen-header";
import { ProfileSkeleton, ProfileView } from "@/components/profile/profile-view";
import { useAuth } from "@/components/providers/auth-provider";
import { ErrorState } from "@/components/ui/state";
import { getProfile } from "@/lib/api-client";
import { handleOf } from "@/lib/format";
import { useApi } from "@/lib/use-api";

export default function UserProfilePage({ params }: PageProps<"/u/[handle]">) {
  const { handle } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const profile = useApi(() => getProfile(decodeURIComponent(handle)), [handle]);

  // Your own profile lives at /profile (with edit + logout).
  useEffect(() => {
    if (user && profile.data?.id === user.id) router.replace("/profile");
  }, [user, profile.data?.id, router]);

  return (
    <>
      <ScreenHeader back="/home" title={profile.data ? `@${handleOf(profile.data)}` : "Profile"} />
      {profile.loading ? (
        <ProfileSkeleton />
      ) : !profile.data ? (
        <div className="px-4 pt-2">
          <ErrorState message={profile.error ?? "User not found"} onRetry={profile.reload} />
        </div>
      ) : (
        <ProfileView profile={profile.data} isMe={false} />
      )}
    </>
  );
}
