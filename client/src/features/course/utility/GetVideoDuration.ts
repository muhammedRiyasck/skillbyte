export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      // Return duration in seconds, rounded to nearest whole second
      const durationInSeconds = Math.round(video.duration);
      resolve(durationInSeconds);
    };
    video.onerror = () => reject(new Error("Cannot load video metadata"));
    video.src = URL.createObjectURL(file);
  });
}
