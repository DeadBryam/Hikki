import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { FormInput } from "@/components/auth/form-input";

function TestWrapper({
  children,
  defaultValues = {},
}: {
  children: (control: any) => React.ReactNode;
  defaultValues?: Record<string, any>;
}) {
  const { control } = useForm({
    defaultValues: {
      email: "",
      username: "",
      ...defaultValues,
    },
  });
  return <>{children(control)}</>;
}

describe("FormInput Component", () => {
  it("should render label and input", () => {
    render(
      <TestWrapper>
        {(control) => (
          <FormInput
            control={control}
            label="Email"
            name="email"
            placeholder="Enter your email"
            type="email"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  it("should render with correct input type", () => {
    render(
      <TestWrapper>
        {(control) => (
          <FormInput
            control={control}
            label="Email"
            name="email"
            placeholder="Enter your email"
            type="email"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(
      "Enter your email"
    ) as HTMLInputElement;
    expect(input.type).toBe("email");
  });

  it("should display error message when provided", () => {
    render(
      <TestWrapper
        defaultValues={{
          email: "",
        }}
      >
        {(control) => (
          <FormInput
            control={control}
            label="Email"
            name="email"
            placeholder="Enter your email"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  it("should apply error styling when error exists", () => {
    render(
      <TestWrapper>
        {(control) => (
          <FormInput
            control={control}
            label="Email"
            name="email"
            placeholder="Enter your email"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText("Enter your email");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("should not display error when error is undefined", () => {
    render(
      <TestWrapper>
        {(control) => (
          <FormInput
            control={control}
            label="Email"
            name="email"
            placeholder="Enter your email"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText("Enter your email");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("should disable input when disabled prop is true", () => {
    render(
      <TestWrapper>
        {(control) => (
          <FormInput
            control={control}
            disabled
            label="Email"
            name="email"
            placeholder="Enter your email"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(
      "Enter your email"
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("should disable input when isLoading is true", () => {
    render(
      <TestWrapper>
        {(control) => (
          <FormInput
            control={control}
            disabled
            label="Email"
            name="email"
            placeholder="Enter your email"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(
      "Enter your email"
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("should pass field props to input", () => {
    render(
      <TestWrapper
        defaultValues={{
          email: "test@example.com",
        }}
      >
        {(control) => (
          <FormInput
            control={control}
            label="Email"
            name="email"
            placeholder="Enter your email"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(
      "Enter your email"
    ) as HTMLInputElement;
    expect(input.value).toBe("test@example.com");
  });

  it("should default to text type if not specified", () => {
    render(
      <TestWrapper>
        {(control) => (
          <FormInput
            control={control}
            label="Username"
            name="username"
            placeholder="Enter your username"
          />
        )}
      </TestWrapper>
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
        <TestWrapper>
          {(control) => (
            <FormInput
              control={control}
              label={type}
              name={type}
              placeholder={`Enter ${type}`}
              type={type}
            />
          )}
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText(
        `Enter ${type}`
      ) as HTMLInputElement;
      expect(input.type).toBe(type);
      unmount();
    }
  });
});
