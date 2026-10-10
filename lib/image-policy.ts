export type RemoteImageSource = { protocol: string; hostname: string; pathname?: string };

// Match the same narrow public-image sources used by Next's server optimizer.
export function isOptimizedRemoteImage(src: string, sources: RemoteImageSource[]) {
  try {
    const url = new URL(src);
    return !url.username && !url.password && !url.port && sources.some(source =>
      url.protocol === `${source.protocol}:` && url.hostname === source.hostname &&
      (!source.pathname || url.pathname.startsWith(source.pathname.replace(/\*\*$/, "")))
    );
  } catch { return false; }
}
