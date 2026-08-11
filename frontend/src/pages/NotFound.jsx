import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { Logo } from "../components/Logo.jsx";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-app px-6 text-center">
      <Logo size={40} />
      <p className="text-7xl font-extrabold tracking-tight text-brand-600">404</p>
      <div>
        <h1 className="text-2xl font-bold text-fg">Page not found</h1>
        <p className="mt-1.5 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      </div>
      <Link to="/dashboard">
        <Button size="lg">Back to dashboard</Button>
      </Link>
    </div>
  );
}
