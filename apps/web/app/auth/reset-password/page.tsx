"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { FormError } from "@/components/auth/form-error";
import { FormSubmitButton } from "@/components/auth/form-submit-button";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/lib/schemas/auth";
import { authService } from "@/lib/services/auth-service";
import { toast } from "@/lib/toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setTokenError("El enlace es inválido");
      return;
    }

    async function validateToken() {
      try {
        if (!token) {
          return;
        }
        await authService.validateResetToken(token);
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        const message =
          error instanceof Error
            ? error.message
            : "El enlace es inválido o ha expirado";
        setTokenError(message);
      }
    }

    validateToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error("Token no proporcionado");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      toast.success("Contraseña reseteada exitosamente");
      router.push("/auth/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al resetear contraseña";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <AuthCard
        subtitle="El enlace no es válido o ha expirado"
        title="Enlace inválido"
      >
        <div className="space-y-6">
          <FormError message={tokenError || "Enlace inválido o expirado"} />
          <Link
            className="inline-block rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
            href="/auth/forgot-password"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (tokenValid === null) {
    return (
      <AuthCard subtitle="Validando enlace..." title="Restablecer contraseña">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Por favor espera...</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      subtitle="Ingresa tu nueva contraseña"
      title="Restablecer contraseña"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput
                disabled={isLoading}
                error={errors.password}
                field={field}
                label="Nueva contraseña"
                name="password"
                placeholder="Nueva contraseña"
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

        <FormSubmitButton isLoading={isLoading}>
          Cambiar contraseña
        </FormSubmitButton>
      </form>

      <div className="border-border border-t pt-4 text-center">
        <Link
          className="text-primary text-sm hover:underline"
          href="/auth/login"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </AuthCard>
  );
}
