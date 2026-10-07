"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowDownIcon, ArrowUpIcon, Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryInput } from "@/lib/admin/categories";
import { slugify } from "@/lib/admin/product-schema";
import {
  deleteCategoryAction,
  moveCategoryAction,
  saveCategoryAction,
  type CategoryResult,
} from "@/lib/actions/admin-categories";
import { ImageUploader } from "./image-uploader";

type Category = {
  id: string;
  name: string;
  slug: string;
  type: "SAREE" | "KURTI";
  image: string | null;
  _count: { products: number };
};

const EMPTY: CategoryInput = { name: "", slug: "", type: "SAREE", image: "" };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<{ id: string | null; values: CategoryInput } | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  function act(fn: () => Promise<CategoryResult>, success?: string, after?: () => void) {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        if (success) toast.success(success);
        after?.();
      } else toast.error(res.error);
    });
  }

  const v = editing?.values;
  const set = (patch: Partial<CategoryInput>) => editing && setEditing({ ...editing, values: { ...editing.values, ...patch } });

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl md:text-4xl">Categories</h1>
        <Button
          onClick={() => {
            setSlugTouched(false);
            setEditing({ id: null, values: EMPTY });
          }}
        >
          <PlusIcon aria-hidden /> Add category
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        The order here is the order of the tiles on the home page.
      </p>

      <ul className="mt-5 divide-y divide-border rounded-md border border-border bg-surface">
        {categories.map((c, i) => (
          <li key={c.id} className="flex items-center gap-3 p-3 md:px-4">
            <div className="relative aspect-4/5 w-12 shrink-0 overflow-hidden rounded-sm bg-muted">
              {c.image && <Image src={c.image} alt="" fill sizes="48px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-muted-foreground">
                {c.type === "SAREE" ? "Sarees" : "Kurtis"} · {c._count.products} product{c._count.products === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex shrink-0">
              <button
                type="button"
                aria-label={`Move ${c.name} up`}
                disabled={i === 0 || pending}
                onClick={() => act(() => moveCategoryAction(c.id, -1))}
                className="flex size-11 items-center justify-center disabled:opacity-30"
              >
                <ArrowUpIcon className="size-4" />
              </button>
              <button
                type="button"
                aria-label={`Move ${c.name} down`}
                disabled={i === categories.length - 1 || pending}
                onClick={() => act(() => moveCategoryAction(c.id, 1))}
                className="flex size-11 items-center justify-center disabled:opacity-30"
              >
                <ArrowDownIcon className="size-4" />
              </button>
              <button
                type="button"
                aria-label={`Edit ${c.name}`}
                onClick={() => {
                  setSlugTouched(true);
                  setEditing({ id: c.id, values: { name: c.name, slug: c.slug, type: c.type, image: c.image ?? "" } });
                }}
                className="flex size-11 items-center justify-center"
              >
                <PencilIcon className="size-4" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${c.name}`}
                onClick={() => setDeleting(c)}
                className="flex size-11 items-center justify-center text-destructive"
              >
                <Trash2Icon className="size-4" />
              </button>
            </div>
          </li>
        ))}
        {categories.length === 0 && <li className="p-8 text-center text-muted-foreground">No categories yet.</li>}
      </ul>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{editing?.id ? "Edit category" : "Add category"}</DialogTitle>
            <DialogDescription className="sr-only">Category name, type and tile image</DialogDescription>
          </DialogHeader>
          {v && (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                act(() => saveCategoryAction(editing!.id, v), "Category saved", () => setEditing(null));
              }}
            >
              <div className="grid gap-1.5">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  required
                  autoCapitalize="words"
                  placeholder="e.g. Silk Sarees"
                  value={v.name}
                  onChange={(e) => set({ name: e.target.value, ...(!slugTouched && { slug: slugify(e.target.value) }) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cat-slug">Web address</Label>
                <div className="flex items-center rounded-md border border-input bg-muted/50">
                  <span className="pl-3 text-sm text-muted-foreground">/category/</span>
                  <input
                    id="cat-slug"
                    required
                    autoCapitalize="none"
                    spellCheck={false}
                    value={v.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set({ slug: e.target.value });
                    }}
                    className="h-12 min-w-0 flex-1 bg-transparent pr-3 pl-0.5 text-base outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cat-type">Type</Label>
                <select
                  id="cat-type"
                  value={v.type}
                  onChange={(e) => set({ type: e.target.value as CategoryInput["type"] })}
                  className="h-12 w-full rounded-md border border-input bg-surface px-3 text-base"
                >
                  <option value="SAREE">Sarees</option>
                  <option value="KURTI">Kurtis</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <span className="text-sm font-medium">Tile image</span>
                <ImageUploader
                  folder="anisu/categories"
                  max={1}
                  value={v.image ? [v.image] : []}
                  onChange={(urls) => set({ image: urls[0] ?? "" })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2Icon className="animate-spin" aria-hidden />}
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Delete “{deleting?.name}”?</DialogTitle>
            <DialogDescription>
              {deleting?._count.products
                ? `It still has ${deleting._count.products} product${deleting._count.products === 1 ? "" : "s"}. Move them to another category first.`
                : "This can't be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={pending}>
              Keep it
            </Button>
            {!deleting?._count.products && (
              <Button
                variant="destructive"
                disabled={pending}
                onClick={() => deleting && act(() => deleteCategoryAction(deleting.id), "Category deleted", () => setDeleting(null))}
              >
                {pending && <Loader2Icon className="animate-spin" aria-hidden />}
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
