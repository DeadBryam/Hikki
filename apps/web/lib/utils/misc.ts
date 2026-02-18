import { type ClassValue, clsx } from "clsx";
import Cookies from "js-cookie";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setCookie(name: string, value: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  Cookies.set(name, value, {
    path: "/",
    sameSite: "lax",
    secure: isProduction,
  });
}

export function getCookie(name: string): string | undefined {
  return Cookies.get(name);
}

export function removeCookie(name: string): void {
  Cookies.remove(name, { path: "/" });
}
