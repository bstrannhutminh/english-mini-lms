interface ListeningSourceMedia {
  url: string | null;
  startSeconds: number | null;
  endSeconds: number | null;
}

/** Media belongs to the lesson source; missing metadata never selects another video. */
export function listeningSourceMedia(segment?: ListeningSourceMedia) {
  return {
    videoUrl: segment?.url || null,
    startSeconds: segment?.startSeconds ?? 0,
    endSeconds: segment?.endSeconds ?? 0,
  };
}
