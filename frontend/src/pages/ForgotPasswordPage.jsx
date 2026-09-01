import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Brand } from "../components/ui/Brand.jsx";
import { ThemeToggle } from "../components/ui/ThemeToggle.jsx";
import api, { apiError } from "../utils/api.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setDone(true);
    } catch (err) {
      setError(apiError(err, "Could not send the reset link"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-6">
        <Brand />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-md">
          {done ? (
            <div className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-fg">Check your email</h1>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
                If that email is registered, a reset link is on its way. It expires in 30 minutes.
              </p>
              <Link to="/login" className="mt-6 inline-block text-sm font-medium text-primary">
                Back to log in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-fg">Forgot password</h1>
              <p className="mt-1 text-sm text-muted">
                Enter your email and we will send you a reset link. Students without an email
                should ask the school to reset their password.
              </p>

              <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                  autoComplete="email"
                />
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Send reset link"}
                </Button>
              </form>

              <p className="mt-5 text-sm text-muted">
                <Link to="/login" className="text-primary">Back to log in</Link>
              </p>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
