// left-aligned page header, used across the portal and the inner public pages
export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
      <div>
        <h1 className="font-heading text-xl font-bold text-fg sm:text-[26px]">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export default PageHeader;
