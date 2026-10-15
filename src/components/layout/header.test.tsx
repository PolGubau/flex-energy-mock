import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Header } from "@/components/layout/header";

describe("Header", () => {
  it("renders the balance", () => {
    render(<Header />);
    expect(screen.getByText("$142.50")).toBeInTheDocument();
  });

  it("renders the available balance label", () => {
    render(<Header />);
    expect(screen.getByText("Available Balance")).toBeInTheDocument();
  });
});
