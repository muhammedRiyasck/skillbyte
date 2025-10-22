export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);        // duration in seconds
    };
    video.onerror = () => reject(new Error("Cannot load video metadata"));
    video.src = URL.createObjectURL(file);
  });
}
