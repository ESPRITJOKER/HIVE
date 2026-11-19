import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders an accessible label and handles clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Join class</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Join class" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("supports the disabled state", () => {
    render(<Button disabled>Submit</Button>);
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });
});
