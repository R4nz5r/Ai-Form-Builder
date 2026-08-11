import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { User, Mail, Lock } from "lucide-react";
import { AuthLayout } from "./AuthLayout.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { Button } from "../components/ui/Button.jsx";
import { Input, Field } from "../components/ui/Input.jsx";

export default function Register() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await signup(values);
      toast.success(`Welcome to Timely Forms AI, ${user.name.split(" ")[0]}! 🎉`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold tracking-tight text-fg">Create your account</h2>
      <p className="mt-1.5 text-sm text-muted">Start building forms for free. No credit card.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <Field label="Full name" error={errors.name?.message}>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Jane Cooper"
              className="pl-10"
              invalid={!!errors.name}
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Name is too short" },
              })}
            />
          </div>
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="email"
              placeholder="you@company.com"
              className="pl-10"
              invalid={!!errors.email}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
              })}
            />
          </div>
        </Field>

        <Field label="Password" error={errors.password?.message} hint="At least 6 characters">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="password"
              placeholder="••••••••"
              className="pl-10"
              invalid={!!errors.password}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Use at least 6 characters" },
              })}
            />
          </div>
        </Field>

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
