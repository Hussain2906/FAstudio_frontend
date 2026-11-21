export function PageShell({ title }: { title: string }) {
  return <main aria-labelledby="page-heading" className="storefront-section"><div className="storefront-shell"><p className="type-caption text-muted-foreground">FS Studio</p><h1 className="type-page-heading mt-5" id="page-heading">{title}</h1></div></main>;
}
