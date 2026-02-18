"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLink } from "@/components/auth/auth-link";
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

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ForgotPasswordInput>({
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
      toast.success("Instrucciones enviadas a tu email");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al solicitar reset de contraseña";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthCard
        subtitle="Revisa tu email para continuar"
        title="Instrucciones enviadas"
      >
        <div className="space-y-6 text-center">
          <p className="text-muted-foreground text-sm">
            Hemos enviado instrucciones para resetear tu contraseña a tu email.
            Por favor, revisa tu bandeja de entrada (y spam si es necesario).
          </p>

          <Link
            className="inline-block rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
            href="/auth/login"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      subtitle="Ingresa tu email para recibir instrucciones"
      title="¿Olvidaste tu contraseña?"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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

        <FormSubmitButton isLoading={isLoading}>
          Enviar instrucciones
        </FormSubmitButton>
      </form>

      <div className="pt-4">
        <AuthLink
          href="/auth/login"
          linkText="Aquí"
          text="¿Recordaste tu contraseña?"
        />
      </div>
    </AuthCard>
  );
}
