import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { resetDemoState } from "./demo/store";
import "./i18n/config";

beforeEach(() => {
  resetDemoState();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("Unexpected network request");
    }),
  );
  vi.spyOn(XMLHttpRequest.prototype, "open").mockImplementation(() => {
    throw new Error("Unexpected XHR");
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() { }
      unobserve() { }
      disconnect() { }
    },
  );
  vi.spyOn(window, "scrollTo").mockImplementation(() => { });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("demo routes without a data connection", () => {
  it.each([
    "/",
    "/contracts",
    "/contracts/300",
    "/contracts/300/usage",
    "/contracts/300/invoices",
    "/usage",
    "/recharge",
    "/history",
    "/settings",
    "/settings/faq",
  ])("renders %s with local data", async (path) => {
    window.history.replaceState({}, "", path);
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /^Sign in$/ }));
    expect(
      await screen.findByRole("complementary", { name: "Demo mode" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByRole("heading").length).toBeGreaterThan(0),
    );
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    ["", ""],
    ["not-an-email", "anything"],
    ["someone@example.test", "wrong-password"],
  ])("accepts demo login with email %j and no network", async (email, password) => {
    window.history.replaceState({}, "", "/");
    render(<App />);
    const signIn = await screen.findByRole("button", { name: /^Sign in$/ });
    const emailInput = screen.getByLabelText("Email address");
    const passwordInput = screen.getByLabelText("Password");
    expect(emailInput).not.toBeRequired();
    expect(passwordInput).not.toBeRequired();
    expect(emailInput.closest("form")).toHaveAttribute("novalidate");
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(passwordInput, { target: { value: password } });
    fireEvent.click(signIn);
    expect(await screen.findByRole("complementary", { name: "Demo mode" })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest.prototype.open).not.toHaveBeenCalled();
  });

  it("simulates Google login without contacting Google", async () => {
    window.history.replaceState({}, "", "/");
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "Continue with Google" }));
    expect(await screen.findByRole("complementary", { name: "Demo mode" })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest.prototype.open).not.toHaveBeenCalled();
  });
});
