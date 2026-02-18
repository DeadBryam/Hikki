"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLink } from "@/components/auth/auth-link";
import { FormInput } from "@/components/auth/form-input";
import { FormSubmitButton } from "@/components/auth/form-submit-button";
import { PasswordInput } from "@/components/auth/password-input";
import { type LoginInput, loginSchema } from "@/lib/schemas/auth";
import { authService } from "@/lib/services/auth-service";
import { toast } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginInput>({
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
      toast.success("¡Bienvenido!");
      router.push("/chat");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Bienvenido de vuelta a Hikki" title="Iniciar sesión">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="username"
          render={({ field }) => (
            <FormInput
              disabled={isLoading}
              error={errors.username}
              field={field}
              label="Usuario"
              name="username"
              placeholder="Tu usuario o email"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <PasswordInput
              disabled={isLoading}
              error={errors.password}
              field={field}
              name="password"
              placeholder="Ingresa tu contraseña"
            />
          )}
        />

        <FormSubmitButton isLoading={isLoading}>
          Iniciar sesión
        </FormSubmitButton>
      </form>

      <div className="space-y-3 pt-4">
        <AuthLink
          href="/auth/forgot-password"
          linkText="Recuperar contraseña"
          text="¿Olvidaste tu contraseña?"
        />
        <AuthLink
          href="/auth/signup"
          linkText="Regístrate aquí"
          text="¿No tienes cuenta?"
        />
      </div>
    </AuthCard>
  );
}
