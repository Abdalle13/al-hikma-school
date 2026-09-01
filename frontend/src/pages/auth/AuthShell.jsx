import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { ThemeToggle } from "../../components/ui/ThemeToggle.jsx";

export function AuthShell({ title, description, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-6">
        <Link to="/" className="flex items-center gap-2 font-heading font-bold text-fg">
          <GraduationCap className="h-5 w-5 text-primary" />
          School Name
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-md">
          <h1 className="text-xl font-bold text-fg">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          <div className="mt-5">{children}</div>
          {footer ? <div className="mt-5 text-sm text-muted">{footer}</div> : null}
        </Card>
      </main>
    </div>
  );
}

export default AuthShell;
