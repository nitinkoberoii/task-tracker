import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import { DemoAuthProvider } from "./DemoAuth";
import { LoginPage } from "./LoginPage";

afterEach(() => localStorage.clear());

it("accepts the documented demo credentials", () => {
  render(<DemoAuthProvider><MemoryRouter><LoginPage /></MemoryRouter></DemoAuthProvider>);

  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "demo@tasktracker.local" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "demo123" } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

  expect(localStorage.getItem("smart-task-tracker-demo-session")).toBe("active");
});
