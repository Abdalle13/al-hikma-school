import { PageHeader } from "../../components/PageHeader.jsx";

// simple wrapper for the inner public pages while they are still placeholders
export function PublicPageShell({ title, description, children }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:py-16">
      <PageHeader title={title} description={description} />
      <div className="prose-none text-sm text-muted">
        {children || (
          <p>
            This page is a placeholder for phase 1. Its sections and any dynamic
            content get built in the frontend phases.
          </p>
        )}
      </div>
    </div>
  );
}

export default PublicPageShell;
