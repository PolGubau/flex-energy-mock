import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Header } from "@/components/layout/header";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { firstName: "Alex", lastName: "Demo" } }),
}));
vi.mock("@/context/AppContext", () => ({
  useApp: () => ({ state: { notifications: [] }, markNotificationAsRead: vi.fn(), clearNotifications: vi.fn() }),
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

describe("Header", () => {
  it("renders the demo user's name", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText("Alex Demo")).toBeInTheDocument();
  });

  it("offers settings and notifications on the dashboard", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });
});
