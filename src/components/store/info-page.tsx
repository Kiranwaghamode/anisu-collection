import type { Metadata } from "next";
import { PageTitle } from "@/components/store/page-title";
import { INFO_PAGES, POLICIES_UPDATED } from "@/config/pages";
import { OG_DEFAULTS } from "@/lib/site";

type InfoPath = (typeof INFO_PAGES)[number]["path"];

/** Title, description, canonical URL and link preview for an information page. */
export function infoPageMetadata(path: InfoPath, description: string): Metadata {
  const { title } = INFO_PAGES.find((p) => p.path === path)!;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OG_DEFAULTS, title, description, url: path },
  };
}

/** Readable long-form layout for About, Contact and the policy pages. */
export function InfoPage({
  path,
  intro,
  showUpdated = false,
  children,
}: {
  path: InfoPath;
  intro?: string;
  /** Show the "Last updated" date (policy pages). */
  showUpdated?: boolean;
  children: React.ReactNode;
}) {
  const { title } = INFO_PAGES.find((p) => p.path === path)!;
  return (
    <div className="container-page pb-16 md:pb-24">
      <PageTitle title={title} subtitle={intro} />
      <div className="max-w-2xl text-[1rem] leading-relaxed text-foreground/85 [&_a]:font-medium [&_a]:text-accent [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[1.6rem] [&_h2]:text-foreground md:[&_h2]:text-3xl [&_li]:pl-1 [&_p]:mt-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
        {showUpdated && <p className="mt-12! text-sm text-muted-foreground">Last updated: {POLICIES_UPDATED}</p>}
      </div>
    </div>
  );
}
