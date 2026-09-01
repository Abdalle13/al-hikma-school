import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { ThemeToggle } from "../components/ui/ThemeToggle.jsx";

export default function LoginPage() {
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
          <h1 className="text-xl font-bold text-fg">Log in</h1>
          <p className="mt-1 text-sm text-muted">Placeholder screen. Auth is wired up in frontend phase 2.</p>

          <form className="mt-5 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <Input label="Email" type="email" placeholder="you@example.com" disabled />
            <Input label="Password" type="password" placeholder="Your password" disabled />
            <Button type="submit" disabled>Log in</Button>
          </form>

          <div className="mt-5 space-y-1 text-sm text-muted">
            <p>New parent? <Link to="/register" className="text-primary">Create an account</Link></p>
            <p><Link to="/forgot-password" className="text-primary">Forgot your password?</Link></p>
          </div>
        </Card>
      </main>
    </div>
  );
}
