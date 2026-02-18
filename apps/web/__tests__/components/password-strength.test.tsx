import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PasswordStrength } from "@/components/auth/password-strength";

describe("PasswordStrength Component", () => {
  it("should render with empty password", () => {
    render(<PasswordStrength password="" />);
    expect(screen.getByText("Fortaleza de contraseña")).toBeInTheDocument();
  });

  it("should show all 5 requirements", () => {
    render(<PasswordStrength password="Test123!" />);
    expect(screen.getByText("8 caracteres mínimo")).toBeInTheDocument();
    expect(screen.getByText("1 mayúscula")).toBeInTheDocument();
    expect(screen.getByText("1 minúscula")).toBeInTheDocument();
    expect(screen.getByText("1 número")).toBeInTheDocument();
    expect(screen.getByText("1 carácter especial")).toBeInTheDocument();
  });

  it("should show very weak strength with no requirements met", () => {
    render(<PasswordStrength password="a" />);
    expect(screen.getByText("Muy débil")).toBeInTheDocument();
  });

  it("should show very weak strength with 2 requirements met", () => {
    render(<PasswordStrength password="Aa" />);
    expect(screen.getByText("Muy débil")).toBeInTheDocument();
  });

  it("should show weak strength with 3 requirements met", () => {
    render(<PasswordStrength password="Aa1" />);
    expect(screen.getByText("Débil")).toBeInTheDocument();
  });

  it("should show normal strength with 4 requirements met", () => {
    render(<PasswordStrength password="Aa1!" />);
    expect(screen.getByText("Normal")).toBeInTheDocument();
  });

  it("should show strong strength with all 5 requirements met", () => {
    render(<PasswordStrength password="Test123!" />);
    expect(screen.getByText("Fuerte")).toBeInTheDocument();
  });

  it("should validate minimum length requirement", () => {
    const { rerender } = render(<PasswordStrength password="Short" />);
    let minLengthText = screen.getByText("8 caracteres mínimo");
    expect(minLengthText).toHaveClass("text-muted-foreground");

    rerender(<PasswordStrength password="LongEnough1!" />);
    minLengthText = screen.getByText("8 caracteres mínimo");
    expect(minLengthText).toHaveClass("text-foreground");
  });

  it("should validate uppercase requirement", () => {
    const { rerender } = render(<PasswordStrength password="lowercase123!" />);
    let uppercaseText = screen.getByText("1 mayúscula");
    expect(uppercaseText).toHaveClass("text-muted-foreground");

    rerender(<PasswordStrength password="Uppercase123!" />);
    uppercaseText = screen.getByText("1 mayúscula");
    expect(uppercaseText).toHaveClass("text-foreground");
  });

  it("should validate lowercase requirement", () => {
    const { rerender } = render(<PasswordStrength password="UPPERCASE123!" />);
    let lowercaseText = screen.getByText("1 minúscula");
    expect(lowercaseText).toHaveClass("text-muted-foreground");

    rerender(<PasswordStrength password="Uppercase123!" />);
    lowercaseText = screen.getByText("1 minúscula");
    expect(lowercaseText).toHaveClass("text-foreground");
  });

  it("should validate number requirement", () => {
    const { rerender } = render(<PasswordStrength password="NoNumbers!" />);
    let numberText = screen.getByText("1 número");
    expect(numberText).toHaveClass("text-muted-foreground");

    rerender(<PasswordStrength password="WithNumbers123!" />);
    numberText = screen.getByText("1 número");
    expect(numberText).toHaveClass("text-foreground");
  });

  it("should validate special character requirement", () => {
    const { rerender } = render(<PasswordStrength password="NoSpecial123" />);
    let specialText = screen.getByText("1 carácter especial");
    expect(specialText).toHaveClass("text-muted-foreground");

    rerender(<PasswordStrength password="WithSpecial123!" />);
    specialText = screen.getByText("1 carácter especial");
    expect(specialText).toHaveClass("text-foreground");
  });

  it("should accept various special characters", () => {
    const specialChars = "!@#$%^&*";
    for (const char of specialChars) {
      const { unmount } = render(
        <PasswordStrength password={`Test123${char}`} />
      );
      const specialText = screen.getByText("1 carácter especial");
      expect(specialText).toHaveClass("text-foreground");
      unmount();
    }
  });

  it("should hide label when showLabel is false", () => {
    render(<PasswordStrength password="Test123!" showLabel={false} />);
    expect(
      screen.queryByText("Fortaleza de contraseña")
    ).not.toBeInTheDocument();
  });

  it("should still show requirements when label is hidden", () => {
    render(<PasswordStrength password="Test123!" showLabel={false} />);
    expect(screen.getByText("8 caracteres mínimo")).toBeInTheDocument();
  });

  it("should render password strength component", () => {
    const { container } = render(<PasswordStrength password="Test" />);
    const strengthDiv = container.querySelector(".space-y-3");
    expect(strengthDiv).toBeInTheDocument();
  });

  it("should not show progress bar for empty password", () => {
    const { container } = render(<PasswordStrength password="" />);
    const roundedDiv = container.querySelector("div[class*='rounded-full']");
    expect(roundedDiv).not.toBeInTheDocument();
  });

  it("should show strength indicator text", () => {
    render(<PasswordStrength password="Pass1" />);
    expect(screen.getByText("Débil")).toBeInTheDocument();
  });
});
