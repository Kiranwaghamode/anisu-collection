import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

export function SectionHeading({
  title,
  eyebrow,
  href,
  linkLabel = "View all",
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[0.7rem] font-semibold tracking-[0.18em] text-accent uppercase">{eyebrow}</p>
        )}
        <h2 className="text-[1.6rem] md:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="-mr-2 flex min-h-11 shrink-0 items-center gap-1.5 px-2 text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          {linkLabel}
          <ArrowRightIcon className="size-4" />
        </Link>
      )}
    </div>
  );
}
