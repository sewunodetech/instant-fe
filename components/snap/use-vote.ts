"use client";

import { useCallback, useState } from "react";
import { ApiClientError, errorMessage, unvotePost, votePost } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import type { ApiPost } from "@/lib/types";

/** Optimistic vote toggle for a snap; rolls back if the API rejects it. */
export function useVote(post: ApiPost, onChange?: (post: ApiPost) => void) {
  const { user } = useAuth();
  const [state, setState] = useState({ voteCount: post.voteCount, hasVoted: post.hasVoted });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwn = user?.id === post.user.id;
  const closed = post.campaign.status !== "ACTIVE";
  const disabledReason = isOwn ? "This is your snap" : closed ? "Voting closed" : null;

  const toggle = useCallback(async () => {
    if (pending || disabledReason) return;
    const previous = state;
    const next = { hasVoted: !previous.hasVoted, voteCount: previous.voteCount + (previous.hasVoted ? -1 : 1) };
    setState(next);
    setPending(true);
    setError(null);
    try {
      const result = previous.hasVoted ? await unvotePost(post.id) : await votePost(post.id);
      setState(result);
      onChange?.({ ...post, ...result });
      if (result.hasVoted) navigator.vibrate?.([20, 40, 20]);
    } catch (e) {
      if (e instanceof ApiClientError && e.statusCode === 409) {
        setState({ hasVoted: true, voteCount: previous.voteCount });
      } else {
        setState(previous);
        setError(errorMessage(e, "Vote failed. Try again."));
      }
    } finally {
      setPending(false);
    }
  }, [pending, disabledReason, state, post, onChange]);

  return { ...state, toggle, pending, error, disabledReason, isOwn };
}
