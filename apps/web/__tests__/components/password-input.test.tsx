import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { PasswordInput } from "@/components/auth/password-input";

function TestWrapper({
  children,
  defaultValues = {},
}: {
  children: (control: any) => React.ReactNode;
  defaultValues?: Record<string, any>;
}) {
  const { control } = useForm({
    defaultValues: {
      password: "",
      newPassword: "",
      ...defaultValues,
    },
  });
  return <>{children(control)}</>;
}

describe("PasswordInput Component", () => {
  it("should render label and input", () => {
    render(
      <TestWrapper>
        {(control) => (
          <PasswordInput
            control={control}
            name="password"
            placeholder="Enter password"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
  });

  it("should render custom label", () => {
    render(
      <TestWrapper>
        {(control) => (
          <PasswordInput
            control={control}
            label="New Password"
            name="newPassword"
            placeholder="Enter new password"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
  });

  it("should start with password hidden", () => {
    render(
      <TestWrapper>
        {(control) => (
          <PasswordInput
            control={control}
            name="password"
            placeholder="Enter password"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    ) as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("should toggle password visibility on button click", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        {(control) => (
          <PasswordInput
            control={control}
            name="password"
            placeholder="Enter password"
          />
        )}
      </TestWrapper>
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
    render(
      <TestWrapper>
        {(control) => (
          <PasswordInput
            control={control}
            name="password"
            placeholder="Enter password"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
  });

  it("should apply error styling", () => {
    render(
      <TestWrapper>
        {(control) => (
          <PasswordInput
            control={control}
            name="password"
            placeholder="Enter password"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("should disable input when disabled prop is true", () => {
    render(
      <TestWrapper>
        {(control) => (
          <PasswordInput
            control={control}
            disabled
            name="password"
            placeholder="Enter password"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("should disable input when isLoading is true", () => {
    render(
      <TestWrapper>
        {(control) => (
          <PasswordInput
            control={control}
            disabled
            name="password"
            placeholder="Enter password"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("should have proper accessibility attributes", () => {
    render(
      <TestWrapper>
        {(control) => (
          <PasswordInput
            control={control}
            name="password"
            placeholder="Enter password"
          />
        )}
      </TestWrapper>
    );

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toHaveAttribute("aria-label");
  });

  it("should update aria-label on visibility toggle", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        {(control) => (
          <PasswordInput
            control={control}
            name="password"
            placeholder="Enter password"
          />
        )}
      </TestWrapper>
    );

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toHaveAttribute("aria-label", "Show password");

    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-label", "Hide password");
  });
});
