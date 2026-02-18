"use client";

import { CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { BackButton } from "@/components/auth/back-button";
import { FormInput } from "@/components/auth/form-input";
import { authService } from "@/lib/services/auth-service";
import { toast } from "@/lib/toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(!!token);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { control, watch } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const userEmail = watch("email");

  useEffect(() => {
    if (!token) {
      return;
    }

    async function verifyToken() {
      try {
        await authService.verifyEmail(token as string);
        setVerified(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error al verificar email";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    verifyToken();
  }, [token, router]);

  const handleResendEmail = async () => {
    if (!userEmail) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.resendVerification(userEmail);
      toast.success({
        description: "Check your inbox for the verification link",
        title: "Email sent",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error sending verification email";
      toast.error({ description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="w-full">
        <BackButton />
        <AuthCard
          subtitle="Your email has been verified successfully!"
          title="Email Verified!"
        >
          <div className="space-y-6 text-center">
            <div className="success-icon flex animate-success-bounce justify-center">
              <CheckCircle className="size-12 text-green-600 drop-shadow-lg dark:text-green-500" />
            </div>
            <p className="fade-in animate-in text-foreground text-sm delay-200 duration-500">
              Your email has been verified. Redirecting to chat...
            </p>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="w-full">
      <BackButton />
      <AuthCard
        subtitle="Complete your email verification"
        title="Verify Your Email"
      >
        <div className="space-y-6">
          {isLoading && !errorMessage ? (
            <div className="space-y-4 text-center">
              <div className="flex animate-bounce justify-center">
                <Mail className="size-12 text-orange-500 dark:text-orange-400" />
              </div>
              <p className="fade-in animate-in text-muted-foreground text-sm duration-500">
                Verifying your email...
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <Mail className="size-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  We've sent a verification link to your email. If you didn't
                  receive the email, enter your email address below to resend
                  it.
                </p>
              </div>

              {errorMessage && (
                <div className="flex animate-bounce-in items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 shadow-destructive/10 shadow-lg backdrop-blur-sm dark:border-destructive/40 dark:bg-destructive/10 dark:shadow-destructive/20">
                  <p className="font-medium text-destructive text-sm">
                    {errorMessage}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <FormInput
                  control={control}
                  disabled={isLoading}
                  label="Email Address"
                  name="email"
                  placeholder="your@email.com"
                  type="email"
                />

                <button
                  className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 disabled:opacity-50 dark:hover:shadow-orange-400/20"
                  disabled={isLoading || !userEmail}
                  onClick={handleResendEmail}
                  type="button"
                >
                  {isLoading ? "Sending..." : "Resend Verification"}
                </button>
              </div>

              <div className="border-border border-t pt-4 text-center">
                <Link
                  className="text-primary text-sm hover:underline"
                  href="/auth/login"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </AuthCard>
    </div>
  );
}
