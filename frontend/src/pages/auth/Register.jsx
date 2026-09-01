import { Link } from "react-router-dom";
import { AuthShell } from "./AuthShell.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";

export function Register() {
  return (
    <AuthShell
      title="Create a parent account"
      description="Placeholder screen. You will enter your child's admission number and an admin will activate the account."
      footer={
        <p>
          Already have an account? <Link to="/login" className="text-primary">Log in</Link>
        </p>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <Input label="Full name" placeholder="Your name" disabled />
        <Input label="Email" type="email" placeholder="you@example.com" disabled />
        <Input label="Phone" placeholder="+252 ..." disabled />
        <Input label="Child admission number" placeholder="e.g. ADM-0001" disabled />
        <Input label="Password" type="password" placeholder="Choose a password" disabled />
        <Button type="submit" disabled>Create account</Button>
      </form>
    </AuthShell>
  );
}

export default Register;
