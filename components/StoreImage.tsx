import Image, { type ImageProps } from "next/image";
import { isOptimizedRemoteImage, type RemoteImageSource } from "@/lib/image-policy";

const sources: RemoteImageSource[] = JSON.parse(process.env.NEXT_PUBLIC_OPTIMIZED_IMAGE_SOURCES || '[{"protocol":"https","hostname":"images.unsplash.com"}]');
export default function StoreImage(props: ImageProps) {
  const src = typeof props.src === "string" && !props.src ? "/favicon.png" : props.src;
  // Optimize configured uploads; arbitrary external image URLs retain their fallback.
  const external = typeof src === "string" && /^https?:/.test(src);
  const unoptimized = external && !isOptimizedRemoteImage(src, sources);
  return <Image {...props} src={src} fetchPriority={props.fetchPriority ?? (props.priority ? "high" : undefined)} unoptimized={props.unoptimized || unoptimized} />;
}
