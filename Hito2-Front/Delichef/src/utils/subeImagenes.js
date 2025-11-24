export async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/dunotcony/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "kits_preset");

  const response = await fetch(url, {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error("Error al subir imagen a Cloudinary");
  }

  return data.secure_url;
}
