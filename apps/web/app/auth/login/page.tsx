"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransitionRouter } from "next-view-transitions";
import { useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLink } from "@/components/auth/auth-link";
import { BackButton } from "@/components/auth/back-button";
import { FormInput } from "@/components/auth/form-input";
import { FormSubmitButton } from "@/components/auth/form-submit-button";
import { PasswordInput } from "@/components/auth/password-input";
import { useLogin } from "@/lib/hooks/auth/mutations/use-login";
import { type LoginInput, loginSchema } from "@/lib/schemas/auth";
import { env } from "@/lib/utils/env";
import setFormErrorsFromServer from "@/lib/utils/form-errors";
import { toast } from "@/lib/utils/toast";

export default function LoginPage() {
  const router = useTransitionRouter();
  const login = useLogin();

  const { control, handleSubmit, setError } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    login.mutate(data, {
      onSuccess: (res) => {
        toast.success({
          description: `Welcome back ${res?.data?.name || "user"}! We're glad to see you again.`,
          title: "Login successful",
        });
        router.replace("/chat");
      },
      onError: (error) => {
        setFormErrorsFromServer(setError, error);
      },
    });
  };

  return (
    <div className="w-full">
      <BackButton />
      <div className="fade-in slide-in-from-bottom-4 animate-in duration-500">
        <AuthCard subtitle={`welcome to ${env.APP_NAME}!`} title="Sign In">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              control={control}
              disabled={login.isPending}
              label="Username or Email"
              name="username"
              placeholder="Enter your username or email"
            />

            <PasswordInput
              control={control}
              disabled={login.isPending}
              name="password"
              placeholder="Enter your password"
            />

            <FormSubmitButton isLoading={login.isPending}>
              Sign In
            </FormSubmitButton>
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
