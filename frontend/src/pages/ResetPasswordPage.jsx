import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { ThemeToggle } from "../components/ui/ThemeToggle.jsx";

export default function ResetPasswordPage() {
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
          <h1 className="text-xl font-bold text-fg">Set a new password</h1>
          <p className="mt-1 text-sm text-muted">Placeholder screen. Opened from the reset link in the email.</p>

          <form className="mt-5 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <Input label="New password" type="password" placeholder="New password" disabled />
            <Input label="Confirm password" type="password" placeholder="Repeat it" disabled />
            <Button type="submit" disabled>Update password</Button>
          </form>

          <p className="mt-5 text-sm text-muted">
            <Link to="/login" className="text-primary">Back to log in</Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
