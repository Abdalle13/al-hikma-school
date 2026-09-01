import { Link } from "react-router-dom";
import { AuthShell } from "./AuthShell.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";

export function Login() {
  return (
    <AuthShell
      title="Log in"
      description="Placeholder screen. Auth gets wired up in frontend phase 2."
      footer={
        <div className="space-y-1">
          <p>
            New parent? <Link to="/register" className="text-primary">Create an account</Link>
          </p>
          <p>
            <Link to="/forgot-password" className="text-primary">Forgot your password?</Link>
          </p>
        </div>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <Input label="Email" type="email" placeholder="you@example.com" disabled />
        <Input label="Password" type="password" placeholder="Your password" disabled />
        <Button type="submit" disabled>Log in</Button>
      </form>
    </AuthShell>
  );
}

export default Login;
