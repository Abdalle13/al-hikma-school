import { PageHeader } from "../components/ui/PageHeader.jsx";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:py-16">
      <PageHeader
        title="Contact"
        description="Address, phone, email and office hours, a map, and a contact form that emails the school and stores the message."
      />
      <p className="text-sm text-muted">
        Placeholder for phase 1. The contact form gets built in the frontend phases.
      </p>
    </div>
  );
}
