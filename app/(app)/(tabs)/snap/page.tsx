"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { BackButton } from "@/components/layout/back-button";
import { createPost, listCampaigns, uploadFile } from "@/lib/api-client";
import { ApiClientError } from "@/lib/api-client";
import { mapApiCampaign } from "@/lib/mappers";
import { activeCampaigns, currentUser, type Campaign, type Snap } from "@/lib/mock-data";

const shutterOptions = ["auto", "portrait", "wide"] as const;
const flashOptions = ["off", "on", "auto"] as const;

export default function CreateSnapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-label-md text-on-surface-variant">
          Loading camera...
        </div>
      }
    >
      <CreateSnapFlow />
    </Suspense>
  );
}

function CreateSnapFlow() {
  const searchParams = useSearchParams();
  const campaignParam = searchParams.get("campaign");
  const [campaigns, setCampaigns] = useState<Campaign[]>(activeCampaigns);
  const [campaignId, setCampaignId] = useState(() => campaignParam ?? activeCampaigns[0]?.id ?? "");
  const [shutter, setShutter] = useState<(typeof shutterOptions)[number]>("auto");
  const [flash, setFlash] = useState<(typeof flashOptions)[number]>("off");
  const [captured, setCaptured] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [live, setLive] = useState(true);
  const [posting, setPosting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postedId, setPostedId] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    listCampaigns({ status: "ACTIVE", limit: 24 })
      .then(({ data }) => {
        if (cancelled || data.length === 0) return;
        const mapped = data.map((c, i) => mapApiCampaign(c, i));
        setCampaigns(mapped);
        setCampaignId((current) => {
          if (current && mapped.some((c) => c.id === current)) return current;
          if (campaignParam && mapped.some((c) => c.id === campaignParam)) return campaignParam;
          return mapped[0]?.id || current;
        });
      })
      .catch(() => {
        setCampaignId((current) => {
          if (current && activeCampaigns.some((c) => c.id === current)) return current;
          if (campaignParam && activeCampaigns.some((c) => c.id === campaignParam)) return campaignParam;
          return activeCampaigns[0]?.id || current;
        });
      });
    return () => {
      cancelled = true;
    };
  }, [campaignParam]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || captured) return;

    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
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
        setCameraReady(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      setCameraReady(false);
    };
  }, [captured]);

  const campaign = useMemo(() => campaigns.find((c) => c.id === campaignId), [campaignId, campaigns]);
  const canPost = Boolean(captured && campaign && !posting && !done);

  const previewImage = captured
    ? capturedUrl || "/mock/snap-summer-cafe.jpg"
    : "/mock/onboarding-hero.jpg";

  const previewSnap: Snap = {
    id: "preview",
    image: previewImage,
    imageAlt: captured ? "Captured snap preview" : "Camera ready",
    campaignId,
    caption: caption || "Your moment...",
    location: location || undefined,
    campaign: {
      tag: campaign?.tag ?? "",
      poolUsdc: campaign?.poolUsdc ?? 0,
      icon: campaign?.kind === "Sponsored" ? "campaign" : "stars",
    },
    rank: 1,
    votes: 0,
    comments: 0,
    creator: {
      handle: currentUser.handle,
      name: currentUser.name,
      initial: currentUser.name[0],
      avatar: currentUser.avatar,
      verified: true,
      online: true,
    },
    postedAgo: "now",
    liveShutter: live && captured,
    featured: false,
  };

  function captureFromVideo() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !cameraReady || !video.videoWidth) return false;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise<boolean>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          setCapturedBlob(blob);
          setCapturedUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          resolve(true);
        },
        "image/jpeg",
        0.9
      );
    });
  }

  async function capture() {
    navigator.vibrate?.(20);
    const ok = await captureFromVideo();
    if (!ok) {
      setCapturedBlob(null);
      setCapturedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
    setError(null);
    setCaptured(true);
  }

  function pickFileFallback() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setCapturedBlob(file);
      setCapturedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setError(null);
      setCaptured(true);
    };
    input.click();
  }

  function retake() {
    setCaptured(false);
    setDone(false);
    setError(null);
    setPostedId(null);
  }

  async function post() {
    if (!canPost || !campaign) return;
    setPosting(true);
    setError(null);
    try {
      let imageUrl = previewImage;
      if (capturedBlob) {
        const uploaded = await uploadFile(capturedBlob, "snap.jpg");
        imageUrl = uploaded.url;
      } else if (typeof window !== "undefined") {
        const res = await fetch(previewImage);
        const blob = await res.blob();
        const uploaded = await uploadFile(blob, "snap.jpg");
        imageUrl = uploaded.url;
      }

      const created = await createPost(campaign.id, imageUrl, caption || undefined);
      setPostedId(created.id);
      setDone(true);
      navigator.vibrate?.([25, 50, 25]);
    } catch (err) {
      if (err instanceof ApiClientError) setError(err.message);
      else setError("Could not post snap. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="flex flex-col gap-space-md px-space-md pt-2 pb-8 sm:px-0">
      <div className="flex items-center justify-between">
        <BackButton fallbackHref="/home" />
        <div className="flex flex-col items-center">
          <h1 className="text-headline-sm tracking-tight">{done ? "Posted!" : "New Snap"}</h1>
          <p className="text-label-sm text-on-surface-variant">Instant cam · no gallery</p>
        </div>
        <Link
          href="/campaigns"
          aria-label="Browse campaigns"
          className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          <Icon name="explore" className="text-[22px]" />
        </Link>
      </div>

      <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
        <div className="mb-space-sm flex items-center justify-between">
          <h2 className="text-label-lg">Campaign</h2>
          <Link href="/campaigns" className="flex items-center text-label-sm text-secondary">
            Explore <Icon name="chevron_right" className="text-[14px]" />
          </Link>
        </div>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {campaigns.map((c) => {
            const active = c.id === campaignId;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCampaignId(c.id)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl transition-all ${
                  active ? "ring-3 ring-secondary ring-offset-2 ring-offset-surface" : "opacity-80 hover:opacity-100"
                }`}
              >
                <Image src={c.cover} alt={c.tag} fill sizes="80px" className="object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-4 pb-1 text-[9px] font-bold text-white">
                  {c.tag}
                </span>
                {active && (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-white">
                    <Icon name="check" className="text-[12px]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {campaign && (
          <p className="mt-space-sm text-body-sm text-on-surface-variant">
            {campaign.tagline} · ends in {campaign.daysLeft}d
          </p>
        )}
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-inverse-surface shadow-card">
        <div className="relative aspect-[4/5] max-h-[min(70vh,600px)] w-full">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className={`absolute inset-0 h-full w-full object-cover transition-all ${
              captured || !cameraReady ? "hidden" : "brightness-90"
            }`}
          />
          <canvas ref={canvasRef} className="hidden" />
          {(!cameraReady || captured) && (
            <Image
              src={previewImage}
              alt={previewSnap.imageAlt}
              fill
              unoptimized={previewImage.startsWith("blob:")}
              sizes="(max-width: 767px) 100vw, 640px"
              className={`object-cover transition-all ${captured ? "" : "brightness-90"}`}
              priority
            />
          )}
          {!captured && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35 text-white backdrop-blur-[1px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
                <Icon name="photo_camera" className="text-[32px]" />
              </div>
              <p className="text-label-md">Tap shutter for an instant capture</p>
              <button
                type="button"
                onClick={pickFileFallback}
                className="mt-1 rounded-full bg-white/15 px-4 py-1.5 text-label-sm ring-1 ring-white/30 backdrop-blur-md"
              >
                Or pick from gallery
              </button>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-label-sm text-white backdrop-blur-md">
              <Icon name="schedule" className="text-[14px]" />
              Instant only
            </span>
            {live && captured && (
              <span className="flex items-center gap-1.5 rounded-full bg-tertiary px-2.5 py-1 text-label-sm text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Live Shutter
              </span>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-3">
            <div className="flex flex-col gap-1 text-[11px] text-white/90">
              <span className="flex items-center gap-1">
                <Icon name="location_on" className="text-[12px]" />
                {location || "Add location"}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="local_fire_department" className="text-[12px]" />
                {campaign?.tag}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Toggle flash"
                onClick={() =>
                  setFlash((f) => (f === "off" ? "on" : f === "on" ? "auto" : "off"))
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md"
              >
                <Icon name={flash === "off" ? "flash_off" : "flash_on"} className="text-[20px]" />
              </button>
              <button
                type="button"
                aria-label="Change shutter mode"
                onClick={() => setShutter((s) => (s === "auto" ? "portrait" : s === "portrait" ? "wide" : "auto"))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md"
              >
                <Icon name="shutter_speed" className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 border-t border-white/10 bg-black/60 px-4 py-4">
          <span className="w-20 text-label-sm text-white/70">{shutter}</span>
          {!captured ? (
            <button
              type="button"
              aria-label="Capture"
              onClick={capture}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white ring-4 ring-white/30 transition-transform active:scale-90"
            >
              <span className="h-12 w-12 rounded-full bg-primary-container ring-2 ring-black/10" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Retake"
              onClick={retake}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white ring-2 ring-white/30 transition-transform active:scale-90"
            >
              <Icon name="refresh" className="text-[26px]" />
            </button>
          )}
          <span className="w-20 text-right text-label-sm text-white/70">{flash}</span>
        </div>
      </section>

      <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
        <label className="mb-2 block text-label-lg" htmlFor="snap-caption">
          Caption
        </label>
        <textarea
          id="snap-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          maxLength={220}
          placeholder="Tell the story of this moment..."
          className="w-full resize-none rounded-2xl bg-surface-container-low p-3 text-body-md outline-none ring-2 ring-transparent transition placeholder:text-on-surface-variant/60 focus:ring-secondary/40"
        />
        <div className="mt-1 flex items-center justify-between text-label-sm text-on-surface-variant">
          <span>{caption.length}/220</span>
          <span className="flex items-center gap-1">
            <Icon name="tag" className="text-[14px]" />
            {campaign?.tag}
          </span>
        </div>

        <label className="mt-space-sm mb-2 block text-label-lg" htmlFor="snap-location">
          Location
        </label>
        <div className="relative">
          <Icon
            name="location_on"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-on-surface-variant"
          />
          <input
            id="snap-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where was this?"
            className="h-12 w-full rounded-full bg-surface-container-low pr-4 pl-10 text-body-md outline-none ring-2 ring-transparent transition placeholder:text-on-surface-variant/60 focus:ring-secondary/40"
          />
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={live}
          onClick={() => setLive((v) => !v)}
          className="mt-space-sm flex w-full items-center justify-between rounded-2xl bg-surface-container-low p-3"
        >
          <span className="flex items-center gap-2 text-label-md">
            <Icon name="videocam" className="text-[18px] text-secondary" />
            Live Shutter
          </span>
          <span
            className={`relative h-7 w-12 rounded-full transition-colors ${live ? "bg-secondary" : "bg-surface-container-highest"}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${live ? "left-6" : "left-1"}`}
            />
          </span>
        </button>
      </section>

      {done ? (
        <div className="flex flex-col gap-space-sm rounded-3xl bg-tertiary-container/40 p-space-md text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tertiary text-white">
            <Icon name="check_circle" filled className="text-[28px]" />
          </div>
          <p className="text-headline-sm">Snap is live</p>
          <p className="text-body-sm text-on-surface-variant">Community can vote free or support you with USDC.</p>
          {error && <p className="text-body-sm text-error">{error}</p>}
          <div className="mt-1 flex gap-2">
            <Link
              href="/home"
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-surface-container-lowest text-label-md shadow-sm"
            >
              Home
            </Link>
            <Link
              href={postedId ? `/snaps/${postedId}` : `/campaigns/${campaignId}`}
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-secondary text-label-md text-white shadow-sm"
            >
              {postedId ? "View Snap" : "View Campaign"}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <p className="rounded-2xl bg-error/10 px-4 py-3 text-body-sm text-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={post}
            disabled={!canPost}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary-container text-headline-sm text-on-primary-fixed shadow-shutter transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {posting ? (
              <Icon name="progress_activity" className="animate-spin text-[24px]" />
            ) : (
              <Icon name="bolt" className="text-[24px]" />
            )}
            <span>{posting ? "Posting..." : captured ? "Post to Campaign" : "Capture first"}</span>
          </button>
        </>
      )}
    </div>
  );
}
