"use client";

import { CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
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
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    async function verifyToken() {
      try {
        await authService.verifyEmail(token as string);
        setVerified(true);
        setTimeout(() => {
          router.push("/chat");
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
      toast.success("Email reenviado correctamente");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al reenviar verificación";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (verified) {
    return (
      <AuthCard
        subtitle="Tu email ha sido verificado exitosamente"
        title="¡Verificado!"
      >
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle className="size-12 text-green-600 dark:text-green-500" />
          </div>
          <p className="text-foreground text-sm">
            Tu email ha sido verificado. Redirigiendo a chat...
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      subtitle="Completa la verificación de tu email"
      title="Verifica tu email"
    >
      <div className="space-y-6">
        {isLoading && !errorMessage ? (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Mail className="size-12 animate-pulse text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Verificando tu email...
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <Mail className="size-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                Hemos enviado un enlace de verificación a tu email. Si no
                recibiste el email, ingresa tu dirección de correo electrónico a
                continuación para reenviarlo.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-3 rounded-md border-destructive border-l-4 bg-destructive/10 px-4 py-3">
                <p className="text-destructive text-sm">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-3">
              <FormInput
                disabled={isLoading}
                field={{
                  value: userEmail,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    setUserEmail(e.target.value),
                }}
                label="Email"
                name="email"
                placeholder="tu@email.com"
                type="email"
              />

              <button
                className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                disabled={isLoading || !userEmail}
                onClick={handleResendEmail}
                type="button"
              >
                {isLoading ? "Reenviando..." : "Reenviar email"}
              </button>
            </div>

            <div className="border-border border-t pt-4 text-center">
              <Link
                className="text-primary text-sm hover:underline"
                href="/auth/login"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthCard>
  );
}
