import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { TaskFormPage } from "./TaskFormPage";

const mocks = vi.hoisted(() => ({
  createTask: vi.fn().mockResolvedValue({ id: 1 }),
}));

vi.mock("../../lib/api", () => ({
  createTask: mocks.createTask,
  getTask: vi.fn(),
  getTaskInsights: vi.fn().mockResolvedValue({ suggested_priority: "low", duplicates: [] }),
  listCategories: vi.fn().mockResolvedValue([
    { id: 4, name: "Work", created_at: "2026-09-03T00:00:00Z" },
  ]),
  updateTask: vi.fn(),
}));

it("creates a task with its selected category", async () => {
  render(<TaskFormPage mode="create" />, { wrapper: MemoryRouter });

  await screen.findByRole("option", { name: "Work" });
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Prepare demo" } });
  fireEvent.change(screen.getByLabelText(/Category/), { target: { value: "4" } });
  fireEvent.click(screen.getByRole("button", { name: "Save task" }));

  await waitFor(() => {
    expect(mocks.createTask).toHaveBeenCalledWith({ title: "Prepare demo", description: "", category_id: 4, due_date: null });
  });
});

it("shows validation when the task title is blank", async () => {
  render(<TaskFormPage mode="create" />, { wrapper: MemoryRouter });

  await screen.findByRole("option", { name: "Work" });
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: " " } });
  fireEvent.click(screen.getByRole("button", { name: "Save task" }));

  expect(screen.getByRole("alert")).toHaveTextContent("Enter a task title.");
});
