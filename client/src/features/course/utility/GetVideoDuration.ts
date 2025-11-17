export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(Math.round((video.duration / 60) * 100) / 100);        // duration in minutes, rounded to 2 decimal places
    };
    video.onerror = () => reject(new Error("Cannot load video metadata"));
    video.src = URL.createObjectURL(file);
  });
}
