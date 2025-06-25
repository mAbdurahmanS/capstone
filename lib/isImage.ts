export function isImage(url: string) {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const ext = url.split(".").pop()?.toLowerCase();
  return ext && imageExtensions.includes(ext);
}
