import "server-only";
import { createHash } from "node:crypto";

export const UPLOAD_FOLDERS = ["anisu/products", "anisu/categories"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

/**
 * Applied by Cloudinary as the photo is stored: cap the size and compress, so a
 * 5 MB camera photo is kept at a few hundred KB (saves free-plan storage).
 */
const INCOMING_TRANSFORMATION = "c_limit,w_1800,h_2250/q_auto:good";

/** Parameters for a signed browser upload straight to Cloudinary (the secret never leaves the server). */
export function signUpload(folder: UploadFolder) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary env variables are not set");

  const params = {
    folder,
    timestamp: String(Math.floor(Date.now() / 1000)),
    transformation: INCOMING_TRANSFORMATION,
  };
  // Signature = sha1 of the params sorted by name, joined as k=v&k=v, plus the secret.
  const toSign = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const signature = createHash("sha1").update(toSign + apiSecret).digest("hex");

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    fields: { ...params, api_key: apiKey, signature },
  };
}
