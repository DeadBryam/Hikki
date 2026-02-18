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
import { PasswordStrength } from "@/components/auth/password-strength";
import { type SignupInput, signupSchema } from "@/lib/schemas/auth";
import { authService } from "@/lib/services/auth-service";
import { toast } from "@/lib/toast";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<SignupInput>({
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
      toast.success("¡Registro exitoso! Verifica tu email");
      router.push("/auth/verify-email");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al registrarse";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Únete a Hikki hoy mismo" title="Crear cuenta">
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
              placeholder="Tu nombre de usuario"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <FormInput
              disabled={isLoading}
              error={errors.email}
              field={field}
              label="Email"
              name="email"
              placeholder="tu@email.com"
              type="email"
            />
          )}
        />

        <div className="space-y-2">
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput
                disabled={isLoading}
                error={errors.password}
                field={field}
                label="Contraseña"
                name="password"
                placeholder="Contraseña segura"
              />
            )}
          />
          {password && <PasswordStrength password={password} />}
        </div>

        <Controller
          control={control}
          name="passwordConfirm"
          render={({ field }) => (
            <PasswordInput
              disabled={isLoading}
              error={errors.passwordConfirm}
              field={field}
              label="Confirmar contraseña"
              name="passwordConfirm"
              placeholder="Confirma tu contraseña"
            />
          )}
        />

        <FormSubmitButton isLoading={isLoading}>Crear cuenta</FormSubmitButton>
      </form>

      <div className="pt-4">
        <AuthLink
          href="/auth/login"
          linkText="Inicia sesión aquí"
          text="¿Ya tienes cuenta?"
        />
      </div>
    </AuthCard>
  );
}
