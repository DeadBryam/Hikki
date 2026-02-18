import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PasswordInput } from "@/components/auth/password-input";

describe("PasswordInput Component", () => {
  const mockField = {
    value: "",
    onChange: vi.fn(),
    onBlur: vi.fn(),
  };

  beforeEach(() => {
    mockField.onChange.mockClear();
    mockField.onBlur.mockClear();
  });

  it("should render label and input", () => {
    render(
      <PasswordInput
        field={mockField}
        name="password"
        placeholder="Enter password"
      />
    );

    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
  });

  it("should render custom label", () => {
    render(
      <PasswordInput
        field={mockField}
        label="Nueva Contraseña"
        name="newPassword"
        placeholder="Enter new password"
      />
    );

    expect(screen.getByLabelText("Nueva Contraseña")).toBeInTheDocument();
  });

  it("should start with password hidden", () => {
    render(
      <PasswordInput
        field={mockField}
        name="password"
        placeholder="Enter password"
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    ) as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("should toggle password visibility on button click", async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        field={mockField}
        name="password"
        placeholder="Enter password"
      />
    );

    const toggleButton = screen.getByRole("button");
    const input = screen.getByPlaceholderText(
      "Enter password"
    ) as HTMLInputElement;

    expect(input.type).toBe("password");

    await user.click(toggleButton);
    expect(input.type).toBe("text");

    await user.click(toggleButton);
    expect(input.type).toBe("password");
  });

  it("should display error message when provided", () => {
    const error = {
      message: "Password is required",
      type: "required",
    };

    render(
      <PasswordInput
        error={error}
        field={mockField}
        name="password"
        placeholder="Enter password"
      />
    );

    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("should apply error styling", () => {
    const error = {
      message: "Password is too weak",
      type: "invalid",
    };

    render(
      <PasswordInput
        error={error}
        field={mockField}
        name="password"
        placeholder="Enter password"
      />
    );

    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should disable input when disabled prop is true", () => {
    render(
      <PasswordInput
        disabled
        field={mockField}
        name="password"
        placeholder="Enter password"
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("should disable input when isLoading is true", () => {
    render(
      <PasswordInput
        field={mockField}
        isLoading
        name="password"
        placeholder="Enter password"
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("should have proper accessibility attributes", () => {
    render(
      <PasswordInput
        field={mockField}
        name="password"
        placeholder="Enter password"
      />
    );

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toHaveAttribute("aria-label");
  });

  it("should update aria-label on visibility toggle", async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        field={mockField}
        name="password"
        placeholder="Enter password"
      />
    );

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toHaveAttribute("aria-label", "Mostrar contraseña");

    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-label", "Ocultar contraseña");
  });
});
