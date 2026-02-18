"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLink } from "@/components/auth/auth-link";
import { BackButton } from "@/components/auth/back-button";
import { FormInput } from "@/components/auth/form-input";
import { FormSubmitButton } from "@/components/auth/form-submit-button";
import { PasswordInput } from "@/components/auth/password-input";
import { env } from "@/lib/env";
import setFormErrorsFromServer from "@/lib/form-errors";
import { useLogin } from "@/lib/hooks/auth/mutations/use-login";
import { type LoginInput, loginSchema } from "@/lib/schemas/auth";
import { toast } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
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
      onSuccess: () => {
        router.push("/");
        toast.success({
          description: "Logged in successfully",
          title: "Welcome back!",
        });
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
