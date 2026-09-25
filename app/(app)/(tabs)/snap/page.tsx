"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Check,
  ChevronRight,
  CircleCheck,
  Compass,
  ImageUp,
  Loader2,
  RefreshCw,
  SwitchCamera,
  Zap,
} from "lucide-react";
import { headerIconButton, ScreenHeader } from "@/components/layout/screen-header";
import { CampaignCover } from "@/components/campaign/campaign-cover";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { createPost, errorMessage, listCampaignPosts, listCampaigns, uploadFile } from "@/lib/api-client";
import { compressImage } from "@/lib/image";
import { campaignTag, timeLeft } from "@/lib/format";
import { useApi } from "@/lib/use-api";

export default function CreateSnapPage() {
  return (
    <Suspense fallback={<Skeleton className="m-space-md aspect-[4/5] rounded-3xl" />}>
      <CreateSnapFlow />
    </Suspense>
  );
}

type Facing = "environment" | "user";

function CreateSnapFlow() {
  const campaignParam = useSearchParams().get("campaign");
  const campaigns = useApi(() => listCampaigns({ status: "active", limit: 50 }).then((r) => r.data), []);
  const [picked, setPicked] = useState<string | null>(campaignParam);

  const campaignId = useMemo(() => {
    const list = campaigns.data ?? [];
    if (picked && list.some((c) => c.id === picked)) return picked;
    return list[0]?.id ?? null;
  }, [picked, campaigns.data]);
  const campaign = campaigns.data?.find((c) => c.id === campaignId);

  const remaining = useApi(
    campaignId ? () => listCampaignPosts(campaignId, { limit: 1 }).then((r) => r.meta.remainingSnaps) : null,
    [campaignId]
  );

  const [facing, setFacing] = useState<Facing>("environment");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [cameraNonce, setCameraNonce] = useState(0);
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [caption, setCaption] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postedId, setPostedId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (photo) return;
    let stream: MediaStream | null = null;
    let cancelled = false;

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera API unavailable");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1920 } },
          audio: false,
        });
        if (cancelled || !videoRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      } catch {
        if (!cancelled) setCameraError(true);
      }
    })();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [photo, facing, cameraNonce]);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.url);
  }, [photo]);

  async function capture() {
    const video = videoRef.current;
    if (!video || !cameraReady || !video.videoWidth) return;
    navigator.vibrate?.(20);
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (facing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    try {
      const blob = await compressImage(canvas);
      setPhoto({ blob, url: URL.createObjectURL(blob) });
      setError(null);
    } catch {
      setError("Couldn't capture the photo. Try again.");
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const blob = await compressImage(file);
      setPhoto({ blob, url: URL.createObjectURL(blob) });
      setError(null);
    } catch {
      setError("That image couldn't be read. Try another photo.");
    }
  }

  // Reset camera flags whenever we (re)open the stream.
  function restartCamera(update: () => void) {
    setCameraReady(false);
    setCameraError(false);
    update();
  }

  function retake() {
    restartCamera(() => {
      setPhoto(null);
      setError(null);
    });
  }

  async function post() {
    if (!photo || !campaign || posting) return;
    setPosting(true);
    setError(null);
    try {
      const { url } = await uploadFile(photo.blob, "snaps");
      const created = await createPost(campaign.id, url, caption.trim() || undefined);
      setPostedId(created.id);
      navigator.vibrate?.([25, 50, 25]);
    } catch (e) {
      setError(errorMessage(e, "Couldn't post your snap. Please try again."));
    } finally {
      setPosting(false);
    }
  }

  if (postedId && campaign) {
    return (
      <div className="flex flex-col gap-space-md px-space-md pt-6 pb-8 sm:px-0">
        <div className="flex flex-col items-center gap-space-sm rounded-3xl border-2 border-tertiary/20 bg-tertiary-container/40 p-space-lg text-center shadow-soft">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary text-white shadow-sm">
            <CircleCheck size={32} fill="currentColor" />
          </div>
          <p className="text-headline-sm font-extrabold tracking-tight">Your snap is live!</p>
          <p className="text-body-sm text-on-surface-variant">
            Share it so friends can vote. Top 3 in {campaignTag(campaign.title)} win.
          </p>
          <div className="mt-1 flex w-full gap-2">
            <Link
              href={`/campaigns/${campaign.id}`}
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-surface-container-lowest text-label-md shadow-sm"
            >
              Campaign
            </Link>
            <Link
              href={`/snaps/${postedId}`}
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-secondary text-label-md text-white shadow-sm"
            >
              View snap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const noSnapsLeft = remaining.data === 0;
  const canPost = Boolean(photo && campaign && !posting && !noSnapsLeft);

  return (
    <>
    <ScreenHeader
      title="New snap"
      subtitle="Capture it live, post it to a campaign"
      actions={
        <Link href="/campaigns" aria-label="Browse campaigns" className={headerIconButton}>
          <Compass size={20} />
        </Link>
      }
    />
    <div className="flex flex-col gap-4 px-4 pt-2">

      <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
        <div className="mb-space-sm flex items-center justify-between">
          <h2 className="text-label-lg font-extrabold">Campaign</h2>
          <Link href="/campaigns" className="flex items-center text-label-sm font-bold text-secondary">
            Explore <ChevronRight size={14} />
          </Link>
        </div>
        {campaigns.loading ? (
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 shrink-0" />
            ))}
          </div>
        ) : campaigns.error ? (
          <ErrorState message={campaigns.error} onRetry={campaigns.reload} />
        ) : !campaigns.data?.length ? (
          <EmptyState
            icon={<Compass size={24} />}
            title="No live campaigns"
            body="Snaps are posted into a campaign. Start one to get going."
            action={{ label: "Create campaign", href: "/create" }}
          />
        ) : (
          <>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {campaigns.data.map((c) => {
                const active = c.id === campaignId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPicked(c.id)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl transition-all ${
                      active ? "ring-3 ring-secondary ring-offset-2 ring-offset-surface" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <CampaignCover campaign={c} sizes="80px" showTag={false} />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-4 pb-1 text-[9px] font-bold text-white">
                      {campaignTag(c.title)}
                    </span>
                    {active && (
                      <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-white">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {campaign && (
              <p className="mt-space-sm text-body-sm text-on-surface-variant">
                {timeLeft(campaign.endsAt) ?? "Live"}
                {remaining.data != null &&
                  ` · ${remaining.data} of ${campaign.maxPostsPerUser} ${campaign.maxPostsPerUser === 1 ? "snap" : "snaps"} left`}
              </p>
            )}
          </>
        )}
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-inverse-surface shadow-card">
        <div className="relative aspect-[4/5] max-h-[min(70vh,600px)] w-full">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={photo.url} alt="Your snap" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className={`absolute inset-0 h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""} ${
                cameraReady ? "" : "opacity-0"
              }`}
            />
          )}

          {!photo && !cameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
              {cameraError ? (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
                    <CameraOff size={32} />
                  </div>
                  <p className="text-label-md">Camera unavailable</p>
                  <p className="max-w-[16rem] text-body-sm text-white/70">
                    Allow camera access in your browser settings, or take a photo with your phone camera.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => restartCamera(() => setCameraNonce((n) => n + 1))}
                      className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-label-sm ring-1 ring-white/30"
                    >
                      <RefreshCw size={16} />
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-label-sm text-inverse-surface"
                    >
                      <Camera size={16} />
                      Take photo
                    </button>
                  </div>
                </>
              ) : (
                <Loader2 size={32} className="animate-spin text-white/70" />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-black/60 px-6 py-4">
          <button
            type="button"
            aria-label="Use phone camera"
            onClick={() => fileRef.current?.click()}
            disabled={Boolean(photo)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-0"
          >
            <ImageUp size={20} />
          </button>
          {!photo ? (
            <button
              type="button"
              aria-label="Capture"
              onClick={capture}
              disabled={!cameraReady}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white ring-4 ring-white/30 transition-transform active:scale-90 disabled:opacity-50"
            >
              <span className="h-12 w-12 rounded-full bg-secondary-container ring-2 ring-black/10" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Retake"
              onClick={retake}
              disabled={posting}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white ring-2 ring-white/30 transition-transform active:scale-90"
            >
              <RefreshCw size={26} />
            </button>
          )}
          <button
            type="button"
            aria-label="Switch camera"
            onClick={() => restartCamera(() => setFacing((f) => (f === "environment" ? "user" : "environment")))}
            disabled={Boolean(photo) || cameraError}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-0"
          >
            <SwitchCamera size={20} />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </section>

      <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
        <label className="mb-2 flex items-center justify-between text-label-lg font-extrabold" htmlFor="snap-caption">
          Caption
          <span className="text-label-sm font-normal text-on-surface-variant tabular-nums">{caption.length}/280</span>
        </label>
        <textarea
          id="snap-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value.slice(0, 280))}
          rows={2}
          placeholder="Say something about this moment (optional)"
          className="w-full resize-none rounded-2xl bg-surface-container-low p-3 text-body-md outline-none ring-2 ring-transparent transition placeholder:text-on-surface-variant/60 focus:ring-secondary/40"
        />
      </section>

      {error && (
        <p className="rounded-2xl bg-error/10 px-4 py-3 text-body-sm text-error" role="alert">
          {error}
        </p>
      )}
      {noSnapsLeft && campaign && (
        <p className="rounded-2xl bg-surface-container px-4 py-3 text-body-sm text-on-surface-variant">
          You&apos;ve used all your snaps for {campaignTag(campaign.title)}. Pick another campaign.
        </p>
      )}

      <button
        type="button"
        onClick={post}
        disabled={!canPost}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-secondary-container text-headline-sm text-on-secondary shadow-shutter transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {posting ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} />}
        <span>{posting ? "Posting…" : photo ? "Post to campaign" : "Capture first"}</span>
      </button>
    </div>
    </>
  );
}
