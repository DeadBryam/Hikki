import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormSubmitButton } from "@/components/auth/form-submit-button";

describe("FormSubmitButton Component", () => {
  it("should render button with text", () => {
    render(<FormSubmitButton isLoading={false}>Enviar</FormSubmitButton>);
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("should be enabled when not loading", () => {
    render(<FormSubmitButton isLoading={false}>Enviar</FormSubmitButton>);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it("should be disabled when loading", () => {
    render(<FormSubmitButton isLoading={true}>Enviar</FormSubmitButton>);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should show loader icon when loading", () => {
    const { container } = render(
      <FormSubmitButton isLoading={true}>Enviar</FormSubmitButton>
    );
    const loaderIcon = container.querySelector("svg");
    expect(loaderIcon).toBeInTheDocument();
  });

  it("should hide text when loading", () => {
    render(<FormSubmitButton isLoading={true}>Enviar</FormSubmitButton>);
    const button = screen.getByRole("button");
    expect(button.textContent).not.toContain("Enviar");
  });

  it("should show text when not loading", () => {
    render(<FormSubmitButton isLoading={false}>Enviar</FormSubmitButton>);
    expect(screen.getByRole("button")).toHaveTextContent("Enviar");
  });

  it("should have sr-only loading text", () => {
    render(<FormSubmitButton isLoading={true}>Enviar</FormSubmitButton>);
    const srText = screen.getByText("Cargando...");
    expect(srText).toHaveClass("sr-only");
  });

  it("should have submit type", () => {
    render(<FormSubmitButton isLoading={false}>Enviar</FormSubmitButton>);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.type).toBe("submit");
  });

  it("should be disabled when disabled prop is true", () => {
    render(
      <FormSubmitButton disabled isLoading={false}>
        Enviar
      </FormSubmitButton>
    );
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should be disabled when both loading and disabled are true", () => {
    render(
      <FormSubmitButton disabled isLoading={true}>
        Enviar
      </FormSubmitButton>
    );
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should apply custom className", () => {
    render(
      <FormSubmitButton className="custom-class" isLoading={false}>
        Enviar
      </FormSubmitButton>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should have aria-busy attribute when loading", () => {
    render(<FormSubmitButton isLoading={true}>Enviar</FormSubmitButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("should have aria-busy false when not loading", () => {
    render(<FormSubmitButton isLoading={false}>Enviar</FormSubmitButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "false");
  });

  it("should toggle loading state correctly", () => {
    const { rerender } = render(
      <FormSubmitButton isLoading={false}>Enviar</FormSubmitButton>
    );

    let button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(false);

    rerender(<FormSubmitButton isLoading={true}>Enviar</FormSubmitButton>);
    button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    rerender(<FormSubmitButton isLoading={false}>Enviar</FormSubmitButton>);
    button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it("should handle different button texts", () => {
    const texts = ["Enviar", "Registrarse", "Iniciar sesión", "Guardar"];

    for (const text of texts) {
      const { unmount } = render(
        <FormSubmitButton isLoading={false}>{text}</FormSubmitButton>
      );
      expect(screen.getByRole("button")).toHaveTextContent(text);
      unmount();
    }
  });
});
