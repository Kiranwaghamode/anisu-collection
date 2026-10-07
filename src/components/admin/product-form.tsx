"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProductAction } from "@/lib/actions/admin-products";
import {
  OCCASIONS,
  productFormSchema,
  sizesFor,
  slugify,
  type ProductFormInput,
  type ProductFormOutput,
} from "@/lib/admin/product-schema";
import { ImageUploader } from "./image-uploader";

type Category = { id: string; name: string; type: "SAREE" | "KURTI" };
type Suggestions = { fabric: string[]; color: string[]; occasion: string[] };

function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {hint && <span className="font-normal text-muted-foreground"> {hint}</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-surface p-4 md:p-5">
      <h2 className="mb-4 text-2xl">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

const textareaClass =
  "w-full rounded-md border border-input bg-surface px-3.5 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

const selectClass =
  "h-12 w-full rounded-md border border-input bg-surface px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function ProductForm({
  productId,
  initial,
  categories,
  suggestions,
}: {
  productId: string | null;
  initial: ProductFormInput;
  categories: Category[];
  suggestions: Suggestions;
}) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  // New products get their web address from the name until it's edited by hand.
  const [slugTouched, setSlugTouched] = useState(productId !== null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initial,
    mode: "onTouched",
  });

  const type = useWatch({ control, name: "type" });
  const categoryId = useWatch({ control, name: "categoryId" });
  const slug = useWatch({ control, name: "slug" });
  const typeCategories = categories.filter((c) => c.type === type);

  // Validated on the client for instant errors, then the raw values are sent
  // and validated again on the server.
  function onSubmit() {
    startSaving(async () => {
      const res = await saveProductAction(productId, getValues());
      if (!res.ok) {
        if (res.field) setError(res.field as FieldPath<ProductFormInput>, { message: res.error });
        toast.error(res.error);
        return;
      }
      toast.success(productId ? "Product saved" : "Product added");
      if (productId) router.refresh();
      else router.push("/admin/products");
    });
  }

  const err = (name: keyof ProductFormInput) => errors[name]?.message as string | undefined;
  const aria = (name: keyof ProductFormInput) => (errors[name] ? { "aria-invalid": true as const } : {});

  return (
    <form
      noValidate
      onSubmit={(e) => handleSubmit(onSubmit)(e)}
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
    >
      <div className="grid gap-5">
        <Card title="Photos">
          <Controller
            control={control}
            name="images"
            render={({ field }) => (
              <ImageUploader
                folder="anisu/products"
                value={field.value}
                onChange={(urls) => field.onChange(urls)}
                invalid={!!errors.images}
              />
            )}
          />
          {errors.images && (
            <p className="text-sm text-destructive" role="alert">
              {errors.images.message ?? errors.images.root?.message}
            </p>
          )}
        </Card>

        <Card title="Basics">
          <Field id="name" label="Name" error={err("name")}>
            <Input
              id="name"
              autoCapitalize="words"
              placeholder="e.g. Banarasi Silk Saree – Royal Purple"
              {...aria("name")}
              {...register("name", {
                onChange: (e) => {
                  if (!slugTouched) setValue("slug", slugify(e.target.value));
                },
              })}
            />
          </Field>
          <Field id="slug" label="Web address" error={err("slug")}>
            <div className="flex items-center rounded-md border border-input bg-muted/50 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <span className="pl-3 text-sm whitespace-nowrap text-muted-foreground">/product/</span>
              <input
                id="slug"
                autoCapitalize="none"
                spellCheck={false}
                className="h-12 min-w-0 flex-1 bg-transparent pr-3 pl-0.5 text-base outline-none"
                {...aria("slug")}
                {...register("slug", { onChange: () => setSlugTouched(true) })}
              />
            </div>
            {productId && slug !== initial.slug && (
              <p className="text-sm text-amber-800">Changing this breaks links people have already shared.</p>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="type" label="Type" error={err("type")}>
              <select
                id="type"
                className={selectClass}
                {...register("type", {
                  onChange: (e) => {
                    const cat = categories.find((c) => c.id === categoryId);
                    if (cat && cat.type !== e.target.value) setValue("categoryId", "");
                  },
                })}
              >
                <option value="SAREE">Saree</option>
                <option value="KURTI">Kurti</option>
              </select>
            </Field>
            <Field id="categoryId" label="Category" error={err("categoryId")}>
              <select id="categoryId" className={selectClass} {...aria("categoryId")} {...register("categoryId")}>
                <option value="">Choose…</option>
                {typeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {typeCategories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No {type === "SAREE" ? "saree" : "kurti"} categories yet.{" "}
              <Link href="/admin/categories" className="font-medium text-accent underline">
                Add one
              </Link>
            </p>
          )}
        </Card>

        <Card title="Price">
          <div className="grid grid-cols-2 gap-3">
            <Field id="price" label="Selling price (₹)" error={err("price")}>
              <Input id="price" inputMode="decimal" placeholder="1499" {...aria("price")} {...register("price")} />
            </Field>
            <Field id="mrp" label="MRP (₹)" hint="optional" error={err("mrp")}>
              <Input id="mrp" inputMode="decimal" placeholder="1999" {...aria("mrp")} {...register("mrp")} />
            </Field>
          </div>
          <p className="-mt-1 text-sm text-muted-foreground">
            Prices include GST. If the MRP is higher, it shows struck through with the % off.
          </p>
        </Card>

        <Card title={type === "SAREE" ? "Stock" : "Stock by size"}>
          <div className={cn("grid gap-3", type === "SAREE" ? "max-w-40 grid-cols-1" : "grid-cols-3 sm:grid-cols-5")}>
            {sizesFor(type).map((size) => (
              <Field key={`${type}-${size}`} id={`stock-${size}`} label={size} error={errors.stock?.[size]?.message}>
                <Input
                  id={`stock-${size}`}
                  inputMode="numeric"
                  placeholder="0"
                  {...register(`stock.${size}` as const)}
                />
              </Field>
            ))}
          </div>
          <p className="-mt-1 text-sm text-muted-foreground">Pieces in hand. 0 shows as sold out.</p>
        </Card>

        <Card title="Details">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field id="fabric" label="Fabric" error={err("fabric")}>
              <Input id="fabric" list="fabric-list" autoCapitalize="words" {...register("fabric")} />
              <datalist id="fabric-list">
                {suggestions.fabric.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </Field>
            <Field id="color" label="Colour" error={err("color")}>
              <Input id="color" list="color-list" autoCapitalize="words" {...register("color")} />
              <datalist id="color-list">
                {suggestions.color.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </Field>
            <Field id="occasion" label="Occasion" error={err("occasion")}>
              <Input id="occasion" list="occasion-list" autoCapitalize="words" {...register("occasion")} />
              <datalist id="occasion-list">
                {[...new Set([...OCCASIONS, ...suggestions.occasion])].map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </Field>
          </div>
          <p className="-mt-1 text-sm text-muted-foreground">
            These power the shop filters, so reuse the suggested spellings where you can.
          </p>
          <Field id="description" label="Description" error={err("description")}>
            <textarea id="description" rows={4} className={textareaClass} {...aria("description")} {...register("description")} />
          </Field>
          <Field
            id="details"
            label="More details"
            hint={type === "SAREE" ? "(length, blouse piece…)" : "(fit, length, sleeves…)"}
            error={err("details")}
          >
            <textarea
              id="details"
              rows={4}
              className={textareaClass}
              placeholder={type === "SAREE" ? "Saree length: 5.5 m\nBlouse piece: 0.8 m" : "Fit: Straight\nLength: 44 inches"}
              {...register("details")}
            />
            <p className="text-sm text-muted-foreground">One per line, as “Label: value”.</p>
          </Field>
          <Field id="careInfo" label="Care" error={err("careInfo")}>
            <Input id="careInfo" placeholder="e.g. Dry clean only" {...register("careInfo")} />
          </Field>
        </Card>
      </div>

      <div className="grid gap-5 lg:sticky lg:top-8">
        <Card title="Visibility">
          <label className="flex min-h-11 items-center gap-3">
            <input type="checkbox" className="size-5 accent-accent" {...register("isActive")} />
            <span>
              <span className="block font-medium">Show in shop</span>
              <span className="block text-sm text-muted-foreground">Untick to hide without deleting</span>
            </span>
          </label>
          <label className="flex min-h-11 items-center gap-3">
            <input type="checkbox" className="size-5 accent-accent" {...register("isFeatured")} />
            <span>
              <span className="block font-medium">Featured</span>
              <span className="block text-sm text-muted-foreground">Shows in “Featured” on the home page</span>
            </span>
          </label>
        </Card>
        <Card title="Shipping">
          <Field id="weightGrams" label="Weight (grams)" hint="packed" error={err("weightGrams")}>
            <Input id="weightGrams" inputMode="numeric" {...aria("weightGrams")} {...register("weightGrams")} />
          </Field>
        </Card>
        {productId && (
          <Link
            href={`/product/${initial.slug}`}
            target="_blank"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent"
          >
            View in shop <ExternalLinkIcon className="size-4" aria-hidden />
          </Link>
        )}

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2Icon className="animate-spin" aria-hidden />}
            {productId ? "Save changes" : "Add product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
