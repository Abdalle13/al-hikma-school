import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader.jsx";
import { PublicFooter } from "./PublicFooter.jsx";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

export default PublicLayout;
