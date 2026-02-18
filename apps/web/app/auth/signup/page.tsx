"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLink } from "@/components/auth/auth-link";
import { BackButton } from "@/components/auth/back-button";
import { FormInput } from "@/components/auth/form-input";
import { FormSubmitButton } from "@/components/auth/form-submit-button";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { type SignupInput, signupSchema } from "@/lib/schemas/auth";
import { authService } from "@/lib/services/auth-service";
import { toast } from "@/lib/utils/toast";

export default function SignupPage() {
  const router = useTransitionRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, watch } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      await authService.signup(data);
      toast.success({
        description: "Please verify your email",
        title: "Account created",
      });
      router.push("/auth/verify");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error creating account";
      toast.error({ description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <BackButton />
      <div className="fade-in slide-in-from-bottom-4 animate-in duration-500">
        <AuthCard subtitle="Join Hikki today" title="Create Account">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1: Username & Email (2 columns on desktop, 1 on mobile) */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormInput
                control={control}
                disabled={isLoading}
                label="Username"
                name="username"
                placeholder="Enter your username"
              />

              <FormInput
                control={control}
                disabled={isLoading}
                label="Email Address"
                name="email"
                placeholder="your@email.com"
                type="email"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <PasswordInput
                control={control}
                disabled={isLoading}
                label="Password"
                name="password"
                placeholder="Create a strong password"
              />

              <PasswordInput
                control={control}
                disabled={isLoading}
                label="Confirm Password"
                name="passwordConfirm"
                placeholder="Confirm your password"
              />
            </div>

            {password && (
              <AnimatePresence>
                <PasswordStrength password={password} />
              </AnimatePresence>
            )}

            <FormSubmitButton isLoading={isLoading}>
              Create Account
            </FormSubmitButton>

            <div className="fade-in slide-in-from-bottom-2 animate-in pt-4 delay-100 duration-700">
              <AuthLink
                href="/auth/login"
                linkText="Sign in here"
                text="Already have an account?"
              />
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
