import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormInput } from "@/components/auth/form-input";

describe("FormInput Component", () => {
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
      <FormInput
        field={mockField}
        label="Email"
        name="email"
        placeholder="Enter your email"
        type="email"
      />
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  it("should render with correct input type", () => {
    render(
      <FormInput
        field={mockField}
        label="Email"
        name="email"
        placeholder="Enter your email"
        type="email"
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter your email"
    ) as HTMLInputElement;
    expect(input.type).toBe("email");
  });

  it("should display error message when provided", () => {
    const error = {
      message: "Email is required",
      type: "required",
    };

    render(
      <FormInput
        error={error}
        field={mockField}
        label="Email"
        name="email"
        placeholder="Enter your email"
      />
    );

    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("should apply error styling when error exists", () => {
    const error = {
      message: "Invalid email",
      type: "invalid",
    };

    render(
      <FormInput
        error={error}
        field={mockField}
        label="Email"
        name="email"
        placeholder="Enter your email"
      />
    );

    const input = screen.getByPlaceholderText("Enter your email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
  });

  it("should not display error when error is undefined", () => {
    render(
      <FormInput
        field={mockField}
        label="Email"
        name="email"
        placeholder="Enter your email"
      />
    );

    const input = screen.getByPlaceholderText("Enter your email");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("should disable input when disabled prop is true", () => {
    render(
      <FormInput
        disabled
        field={mockField}
        label="Email"
        name="email"
        placeholder="Enter your email"
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter your email"
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("should disable input when isLoading is true", () => {
    render(
      <FormInput
        field={mockField}
        isLoading
        label="Email"
        name="email"
        placeholder="Enter your email"
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter your email"
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("should pass field props to input", () => {
    const fieldProps = {
      value: "test@example.com",
      onChange: vi.fn(),
      onBlur: vi.fn(),
    };

    render(
      <FormInput
        field={fieldProps}
        label="Email"
        name="email"
        placeholder="Enter your email"
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter your email"
    ) as HTMLInputElement;
    expect(input.value).toBe("test@example.com");
  });

  it("should default to text type if not specified", () => {
    render(
      <FormInput
        field={mockField}
        label="Username"
        name="username"
        placeholder="Enter your username"
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter your username"
    ) as HTMLInputElement;
    expect(input.type).toBe("text");
  });

  it("should render all input types correctly", () => {
    const types = [
      "text",
      "email",
      "password",
      "number",
      "tel",
      "url",
    ] as const;

    for (const type of types) {
      const { unmount } = render(
        <FormInput
          field={mockField}
          label={type}
          name={type}
          placeholder={`Enter ${type}`}
          type={type}
        />
      );

      const input = screen.getByPlaceholderText(
        `Enter ${type}`
      ) as HTMLInputElement;
      expect(input.type).toBe(type);
      unmount();
    }
  });
});
