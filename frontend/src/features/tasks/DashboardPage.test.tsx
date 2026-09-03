import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";

vi.mock("../../lib/api", () => ({
  createCategory: vi.fn(),
  deleteTask: vi.fn(),
  getSummary: vi.fn().mockResolvedValue({ total: 2, completed: 1, remaining: 1, completion_percentage: 50 }),
  listCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Personal", created_at: "2026-09-03T00:00:00Z" },
    { id: 2, name: "Work", created_at: "2026-09-03T00:00:00Z" },
  ]),
  listTasks: vi.fn().mockResolvedValue([
    { id: 1, title: "Buy groceries", description: null, status: "pending", category: { id: 1, name: "Personal" } },
    { id: 2, title: "Send update", description: "Weekly status", status: "completed", category: { id: 2, name: "Work" } },
  ]),
  updateTask: vi.fn(),
}));

it("shows summary metrics and filters tasks by category", async () => {
  render(<DashboardPage />, { wrapper: MemoryRouter });

  expect(await screen.findByText("50%")).toBeInTheDocument();
  expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  expect(screen.getByText("Send update")).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText("Category"), { target: { value: "1" } });

  expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  expect(screen.queryByText("Send update")).not.toBeInTheDocument();
});
