export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pt-6 pb-5 md:pt-12 md:pb-8">
      <h1 className="text-[2rem] md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-prose text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
