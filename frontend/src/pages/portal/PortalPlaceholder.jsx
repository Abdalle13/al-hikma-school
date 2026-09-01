import { PageHeader } from "../../components/PageHeader.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";

// used for every portal module until its real screen is built in a later phase
export function PortalPlaceholder({ title, description, icon }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title="Nothing here yet"
        description="This module is a placeholder for phase 1. It gets built after the backend is done and tested."
      />
    </div>
  );
}

export default PortalPlaceholder;
