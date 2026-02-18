"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { BackButton } from "@/components/auth/back-button";
import { FormError } from "@/components/auth/form-error";
import { FormSubmitButton } from "@/components/auth/form-submit-button";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { useResetPassword } from "@/lib/hooks/auth/mutations/use-reset-password";
import { useValidateResetToken } from "@/lib/hooks/auth/mutations/use-validate-reset-token";
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/lib/schemas/auth";
import { toast } from "@/lib/utils/toast";

export default function ResetPasswordPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const validateTokenMutation = useValidateResetToken();
  const resetPasswordMutation = useResetPassword();

  const { control, handleSubmit, watch } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const password = watch("password");

  // biome-ignore lint/correctness/useExhaustiveDependencies: Avoid re-renders
  useEffect(() => {
    if (!token) {
      return;
    }

    validateTokenMutation.mutate(token);
  }, [token]);

  // Handle reset password success/error
  useEffect(() => {
    if (resetPasswordMutation.isSuccess) {
      toast.success({
        description: "You can now sign in with your new password",
        title: "Password updated",
      });
      router.push("/auth/login");
    }
  }, [resetPasswordMutation.isSuccess, router]);

  useEffect(() => {
    if (resetPasswordMutation.error) {
      const message =
        resetPasswordMutation.error instanceof Error
          ? resetPasswordMutation.error.message
          : "Error resetting password";
      toast.error({ description: message });
    }
  }, [resetPasswordMutation.error]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error({
        description: "Token not provided",
        title: "Invalid request",
      });
      return;
    }

    resetPasswordMutation.mutate({
      password: data.password,
      token,
    });
  };

  const isLoading =
    validateTokenMutation.isPending || resetPasswordMutation.isPending;
  const tokenValid = validateTokenMutation.isSuccess;
  const tokenError = validateTokenMutation.error?.message ?? null;

  if (!token || validateTokenMutation.isError) {
    return (
      <div className="w-full">
        <BackButton />
        <AuthCard
          subtitle="The link is invalid or has expired"
          title="Invalid Link"
        >
          <div className="space-y-6">
            <FormError
              message={
                tokenError ||
                (validateTokenMutation.isError
                  ? "The link is invalid or has expired"
                  : "Invalid or expired link")
              }
            />
            <Link
              className="inline-block rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 dark:hover:shadow-orange-400/20"
              href="/auth/forgot-password"
            >
              Request New Link
            </Link>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (validateTokenMutation.isPending || tokenValid === false) {
    return (
      <div className="w-full">
        <BackButton />
        <AuthCard subtitle="Validating link..." title="Set New Password">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Loader className="size-8 animate-spin text-orange-500 dark:text-orange-400" />
            <p className="fade-in animate-in text-muted-foreground text-sm duration-500">
              Please wait...
            </p>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="w-full">
      <BackButton />
      <AuthCard subtitle="Enter your new password" title="Set New Password">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <PasswordInput
              control={control}
              disabled={isLoading}
              label="New Password"
              name="password"
              placeholder="Enter your new password"
            />
            {password && <PasswordStrength password={password} />}
          </div>

          <PasswordInput
            control={control}
            disabled={isLoading}
            label="Confirm Password"
            name="passwordConfirm"
            placeholder="Confirm your password"
          />

          <FormSubmitButton isLoading={isLoading}>
            Update Password
          </FormSubmitButton>
        </form>

        <div className="border-border border-t pt-4 text-center">
          <Link
            className="text-primary text-sm hover:underline"
            href="/auth/login"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
