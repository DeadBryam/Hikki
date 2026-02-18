"use client";

import { CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { BackButton } from "@/components/auth/back-button";
import { FormInput } from "@/components/auth/form-input";
import Divider from "@/components/shared/divider";
import { Button } from "@/components/ui/button";
import { useResendVerification } from "@/lib/hooks/auth/mutations/use-resend-verification";
import { useVerifyEmail } from "@/lib/hooks/auth/mutations/use-verify-email";
import displayErrorsFromServer from "@/lib/utils/display-error";
import { toast } from "@/lib/utils/toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [remainingTime, setRemainingTime] = useState(0);

  const { control, watch } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const userEmail = watch("email");

  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();

  const isLoading =
    verifyEmailMutation.isPending || resendVerificationMutation.isPending;
  const verified = verifyEmailMutation.isSuccess;
  const errorMessage = verifyEmailMutation.error?.message ?? null;

  useEffect(() => {
    if (remainingTime <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyEmailMutation.mutate(token);
  }, [token, verifyEmailMutation]);

  useEffect(() => {
    if (verified) {
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  }, [verified, router]);

  const handleResendEmail = async () => {
    if (!userEmail || remainingTime > 0) {
      return;
    }

    resendVerificationMutation.mutate(userEmail, {
      onSuccess: (res) => {
        console.log("Resend verification response:", res);
        toast.success({
          description:
            res.message || "Check your inbox for the verification link",
          title: "Email sent",
        });
        setRemainingTime(300);
      },
      onError: (error) => {
        displayErrorsFromServer(error as any, {
          type: "warning",
        });

        if (error.code === "CODE_RATE_LIMITED" && error.data?.remaining) {
          setRemainingTime(error.data.remaining);
        }
      },
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
              <div className="flex animate-pulse justify-center">
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
                  disabled={isLoading || remainingTime > 0}
                  label="Email Address"
                  name="email"
                  placeholder="your@email.com"
                  type="email"
                />

                <Divider />

                <Button
                  className="w-full"
                  disabled={isLoading || !userEmail || remainingTime > 0}
                  onClick={handleResendEmail}
                  type="button"
                >
                  {isLoading && "Sending..."}
                  {!isLoading &&
                    remainingTime > 0 &&
                    `Resend in ${formatTime(remainingTime)}`}
                  {!isLoading && remainingTime === 0 && "Resend Verification"}
                </Button>
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
