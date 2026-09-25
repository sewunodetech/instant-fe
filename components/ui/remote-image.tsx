import Image, { type ImageProps } from "next/image";

/**
 * next/image for user uploads. They're already resized before upload and are
 * served (and cached forever) by /api/media, so we skip the optimizer.
 */
export function RemoteImage(props: ImageProps) {
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is forwarded from props
  return <Image unoptimized {...props} />;
}
