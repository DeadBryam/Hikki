import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FormError } from "@/components/auth/form-error";

describe("FormError Component", () => {
  it("should render error message", () => {
    render(<FormError message="This is an error message" />);
    expect(screen.getByText("This is an error message")).toBeInTheDocument();
  });

  it("should have role alert for accessibility", () => {
    render(<FormError message="Error occurred" />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });

  it("should display error icon", () => {
    const { container } = render(<FormError message="Error" />);
    const alertIcon = container.querySelector("svg");
    expect(alertIcon).toBeInTheDocument();
  });

  it("should render dismiss button when onDismiss callback provided", () => {
    render(<FormError message="Error" onDismiss={vi.fn()} />);
    const dismissButton = screen.getByRole("button");
    expect(dismissButton).toBeInTheDocument();
    expect(dismissButton).toHaveTextContent("✕");
  });

  it("should call onDismiss callback when dismiss button clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<FormError message="Error" onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole("button");
    await user.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("should not render dismiss button when onDismiss not provided", () => {
    render(<FormError message="Error" />);
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });

  it("should apply custom className", () => {
    const { container } = render(
      <FormError className="custom-class" message="Error" />
    );
    const alert = container.firstChild;
    expect(alert).toHaveClass("custom-class");
  });

  it("should have proper styling classes", () => {
    const { container } = render(<FormError message="Error" />);
    const alert = container.firstChild;
    expect(alert).toHaveClass("rounded-lg", "border", "border-destructive/30");
  });

  it("should display multiple error messages", () => {
    const { unmount } = render(<FormError message="First error" />);
    expect(screen.getByText("First error")).toBeInTheDocument();
    unmount();

    render(<FormError message="Second error" />);
    expect(screen.getByText("Second error")).toBeInTheDocument();
  });

  it("should handle long error messages", () => {
    const longMessage =
      "This is a very long error message that contains detailed information about what went wrong in the system";
    render(<FormError message={longMessage} />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it("should handle special characters in message", () => {
    render(<FormError message="Error: Invalid input <script>" />);
    expect(
      screen.getByText("Error: Invalid input <script>")
    ).toBeInTheDocument();
  });
});
