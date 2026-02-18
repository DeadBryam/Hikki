"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLink } from "@/components/auth/auth-link";
import { BackButton } from "@/components/auth/back-button";
import { FormInput } from "@/components/auth/form-input";
import { FormSubmitButton } from "@/components/auth/form-submit-button";
import { PasswordInput } from "@/components/auth/password-input";
import { type LoginInput, loginSchema } from "@/lib/schemas/auth";
import { authService } from "@/lib/services/auth-service";
import { toast } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await authService.login(data);
      toast.success({
        description: "Logged in successfully",
        title: "Welcome!",
      });
      router.push("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error signing in";
      toast.error({ description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <BackButton />
      <div className="fade-in slide-in-from-bottom-4 animate-in duration-500">
        <AuthCard subtitle="Welcome back to Hikki" title="Sign In">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              control={control}
              disabled={isLoading}
              label="Username or Email"
              name="username"
              placeholder="Enter your username or email"
            />

            <PasswordInput
              control={control}
              disabled={isLoading}
              name="password"
              placeholder="Enter your password"
            />

            <FormSubmitButton isLoading={isLoading}>Sign In</FormSubmitButton>
          </form>

          <div className="fade-in slide-in-from-bottom-2 animate-in space-y-3 pt-4 delay-100 duration-700">
            <AuthLink
              href="/auth/forgot-password"
              linkText="Click here"
              text="Forgot your password?"
            />
            <AuthLink
              href="/auth/signup"
              linkText="Sign up here"
              text="Don't have an account?"
            />
          </div>
        </AuthCard>
      </div>
    </div>
  );
}
