export async function uploadImage(file: File, kind: "product" | "category" = "product") {
  if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) throw new Error("Use a PNG, JPEG, WebP, or GIF image");
  if (file.size === 0 || file.size > 2 * 1024 * 1024) throw new Error("Images must be between 1 byte and 2 MB");
  const fileData = await new Promise<string>((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });
  const response = await fetch("/api/uploads/" + kind, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ fileName:file.name,fileData }) });
  const result = await response.json();
  if (!response.ok || !result.publicUrl) throw new Error(result.error || "Image upload failed");
  return result.publicUrl as string;
}
