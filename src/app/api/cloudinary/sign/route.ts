import { isAdmin } from "@/lib/auth";
import { UPLOAD_FOLDERS, signUpload, type UploadFolder } from "@/lib/cloudinary";

// Admin-only: hands out a short-lived signature for one upload to Cloudinary.
export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Not logged in" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { folder?: string };
  const folder = UPLOAD_FOLDERS.find((f) => f === body.folder);
  if (!folder) return Response.json({ error: "Invalid folder" }, { status: 400 });

  return Response.json(signUpload(folder as UploadFolder));
}
