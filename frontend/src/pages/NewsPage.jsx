import { PageHeader } from "../components/ui/PageHeader.jsx";

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:py-16">
      <PageHeader
        title="News and events"
        description="Announcements the school marks as public will be listed here, with a page per article."
      />
      <p className="text-sm text-muted">
        Placeholder for phase 1. This list gets wired to the announcements api in the frontend phases.
      </p>
    </div>
  );
}
