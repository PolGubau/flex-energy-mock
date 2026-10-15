import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
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
    expect(
      await screen.findByRole("complementary", { name: "Demo mode" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByRole("heading").length).toBeGreaterThan(0),
    );
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});
