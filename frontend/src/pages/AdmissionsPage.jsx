import { PageHeader } from "../components/ui/PageHeader.jsx";

export default function AdmissionsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:py-16">
      <PageHeader
        title="Admissions"
        description="How to apply, entry requirements, a fee overview and the application form. The form will save an application record for the admin to review."
      />
      <p className="text-sm text-muted">
        Placeholder for phase 1. The application form gets built in the frontend phases.
      </p>
    </div>
  );
}
