"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLink } from "@/components/auth/auth-link";
import { BackButton } from "@/components/auth/back-button";
import { FormInput } from "@/components/auth/form-input";
import { FormSubmitButton } from "@/components/auth/form-submit-button";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/lib/schemas/auth";
import { authService } from "@/lib/services/auth-service";
import { toast } from "@/lib/toast";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { control, handleSubmit } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(data.email);
      setSubmitted(true);
      toast.success({
        description: "Check your email for the reset link",
        title: "Instructions sent",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error requesting password reset";
      toast.error({ description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full">
        <BackButton />
        <AuthCard
          subtitle="Check your email to continue"
          title="Instructions Sent"
        >
          <div className="space-y-6 text-center">
            <div className="success-icon flex animate-success-bounce justify-center">
              <CheckCircle className="size-12 text-green-600 drop-shadow-lg dark:text-green-500" />
            </div>

            <p className="fade-in animate-in text-muted-foreground text-sm delay-200 duration-500">
              We've sent password reset instructions to your email. Please check
              your inbox (and spam folder if needed).
            </p>

            <Link
              className="inline-block rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 dark:hover:shadow-orange-400/20"
              href="/auth/login"
            >
              Back to Sign In
            </Link>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="w-full">
      <BackButton />
      <AuthCard
        subtitle="Enter your email to receive reset instructions"
        title="Reset Password"
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            control={control}
            disabled={isLoading}
            label="Email Address"
            name="email"
            placeholder="your@email.com"
            type="email"
          />

          <FormSubmitButton isLoading={isLoading}>
            Send Reset Link
          </FormSubmitButton>
        </form>

        <div className="pt-4">
          <AuthLink
            href="/auth/login"
            linkText="Here"
            text="Remembered your password?"
          />
        </div>
      </AuthCard>
    </div>
  );
}
