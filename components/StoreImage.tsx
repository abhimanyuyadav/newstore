import Image, { type ImageProps } from "next/image";
export default function StoreImage(props: ImageProps) {
  const src = typeof props.src === "string" && !props.src ? "/favicon.svg" : props.src;
  // Uploaded/custom HTTPS images are fetched by the browser; only the known CDN is optimized.
  const external = typeof src === "string" && /^https?:/.test(src) && new URL(src).hostname !== "images.unsplash.com";
  return <Image {...props} src={src} unoptimized={props.unoptimized || external} />;
}
