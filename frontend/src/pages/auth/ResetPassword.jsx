import { Link } from "react-router-dom";
import { AuthShell } from "./AuthShell.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";

export function ResetPassword() {
  return (
    <AuthShell
      title="Set a new password"
      description="Placeholder screen. Opened from the reset link in the email."
      footer={<p><Link to="/login" className="text-primary">Back to log in</Link></p>}
    >
      <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <Input label="New password" type="password" placeholder="New password" disabled />
        <Input label="Confirm password" type="password" placeholder="Repeat it" disabled />
        <Button type="submit" disabled>Update password</Button>
      </form>
    </AuthShell>
  );
}

export default ResetPassword;
