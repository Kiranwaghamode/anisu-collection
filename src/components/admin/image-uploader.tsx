"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { toast } from "sonner";
import { ArrowDownIcon, ArrowUpIcon, CameraIcon, ImagePlusIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

type Folder = "anisu/products" | "anisu/categories";

/**
 * Shrink a camera photo in the browser before uploading (a 5 MB photo becomes
 * ~500 KB), which matters on mobile data. Falls back to the original file if
 * the browser can't decode it (e.g. some HEIC photos); Cloudinary handles those.
 */
async function shrink(file: File, maxSide = 2000): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
    return blob ?? file;
  } catch {
    return file;
  }
}

async function uploadOne(file: File, folder: Folder): Promise<string> {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (signRes.status === 401) throw new Error("Your session expired. Please log in again.");
  if (!signRes.ok) throw new Error("Couldn't prepare the upload.");
  const { uploadUrl, fields } = (await signRes.json()) as { uploadUrl: string; fields: Record<string, string> };

  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  body.append("file", await shrink(file), file.name.replace(/\.\w+$/, "") + ".jpg");

  const res = await fetch(uploadUrl, { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !json.secure_url) throw new Error(json.error?.message ?? "Upload failed.");
  return json.secure_url;
}

export function ImageUploader({
  value,
  onChange,
  folder,
  max = 10,
  invalid,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: Folder;
  max?: number;
  invalid?: boolean;
}) {
  const id = useId();
  const [uploading, setUploading] = useState(0);

  /** `replace`: single-photo mode swaps the current photo instead of adding. */
  async function handleFiles(list: FileList | null, replace = false) {
    const files = [...(list ?? [])].filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    const kept = replace ? [] : value;
    const room = max - kept.length;
    if (files.length > room) toast.error(`You can add ${room} more photo${room === 1 ? "" : "s"}.`);
    const batch = files.slice(0, Math.max(0, room));
    if (!batch.length) return;

    setUploading(batch.length);
    const results = await Promise.allSettled(batch.map((file) => uploadOne(file, folder)));
    setUploading(0);

    const urls: string[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") urls.push(r.value);
      else toast.error(`${batch[i].name}: ${r.reason instanceof Error ? r.reason.message : "Upload failed."}`);
    });
    if (urls.length) onChange([...kept, ...urls]);
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...value];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  }

  const single = max === 1;
  // Buttons are hidden while a batch uploads, so batches can't overwrite each other.
  const canAdd = uploading === 0 && (single || value.length < max);

  return (
    <div className="grid gap-3">
      {(value.length > 0 || uploading > 0) && (
        <ul className={cn("grid gap-3", single ? "max-w-40 grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}>
          {value.map((url, i) => (
            <li key={url} className="overflow-hidden rounded-md border border-border bg-surface">
              <div className="relative aspect-4/5 bg-muted">
                <Image src={url} alt={`Photo ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover" />
                {i === 0 && !single && (
                  <span className="absolute top-1.5 left-1.5 rounded-sm bg-foreground/80 px-1.5 py-0.5 text-[0.7rem] font-semibold text-white">
                    Main
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                {!single && (
                  <>
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move photo ${i + 1} earlier`}
                      className="flex size-11 items-center justify-center disabled:opacity-30"
                    >
                      <ArrowUpIcon className="size-4 -rotate-90 sm:rotate-0" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === value.length - 1}
                      aria-label={`Move photo ${i + 1} later`}
                      className="flex size-11 items-center justify-center disabled:opacity-30"
                    >
                      <ArrowDownIcon className="size-4 -rotate-90 sm:rotate-0" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label={`Remove photo ${i + 1}`}
                  className="ml-auto flex size-11 items-center justify-center text-destructive"
                >
                  <Trash2Icon className="size-4" />
                </button>
              </div>
            </li>
          ))}
          {Array.from({ length: uploading }, (_, i) => (
            <li key={`up-${i}`} className="flex aspect-4/5 items-center justify-center rounded-md border border-dashed border-border bg-muted">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" aria-label="Uploading" />
            </li>
          ))}
        </ul>
      )}

      {canAdd && (
        <div className="grid grid-cols-2 gap-3 sm:flex">
          {/* On phones this offers camera or gallery; several photos at once. */}
          <label
            htmlFor={`${id}-pick`}
            className={cn(
              "flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border bg-surface px-4 text-sm font-medium",
              invalid ? "border-destructive" : "border-border",
            )}
          >
            <ImagePlusIcon className="size-4.5" aria-hidden />
            {single ? (value.length ? "Replace photo" : "Add photo") : "Add photos"}
          </label>
          <input
            id={`${id}-pick`}
            type="file"
            accept="image/*"
            multiple={!single}
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files, single);
              e.target.value = "";
            }}
          />
          <label
            htmlFor={`${id}-camera`}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium md:hidden"
          >
            <CameraIcon className="size-4.5" aria-hidden />
            Take photo
          </label>
          <input
            id={`${id}-camera`}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files, single);
              e.target.value = "";
            }}
          />
        </div>
      )}
      {!single && (
        <p className="text-sm text-muted-foreground">
          The first photo is the main one. Portrait photos (4:5) look best. Up to {max}.
        </p>
      )}
    </div>
  );
}
