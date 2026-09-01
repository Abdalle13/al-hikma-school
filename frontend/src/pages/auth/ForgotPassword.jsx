import { Link } from "react-router-dom";
import { AuthShell } from "./AuthShell.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";

export function ForgotPassword() {
  return (
    <AuthShell
      title="Forgot password"
      description="Placeholder screen. We will email a reset link, same flow as before."
      footer={<p><Link to="/login" className="text-primary">Back to log in</Link></p>}
    >
      <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <Input label="Email" type="email" placeholder="you@example.com" disabled />
        <Button type="submit" disabled>Send reset link</Button>
      </form>
    </AuthShell>
  );
}

export default ForgotPassword;
