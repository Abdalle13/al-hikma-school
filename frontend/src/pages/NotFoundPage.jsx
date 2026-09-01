import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <p className="font-heading text-5xl font-bold text-primary">404</p>
      <h1 className="mt-3 text-xl font-bold text-fg">Page not found</h1>
      <p className="mt-1 text-sm text-muted">The page you are looking for does not exist.</p>
      <Button as={Link} to="/" className="mt-6">Back to home</Button>
    </div>
  );
}
