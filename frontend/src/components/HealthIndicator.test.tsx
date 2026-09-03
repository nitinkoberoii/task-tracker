import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { HealthIndicator } from "./HealthIndicator";

vi.mock("../lib/api", () => ({
  getHealth: vi.fn().mockResolvedValue({ status: "ok", service: "smart-task-tracker-api" }),
}));

it("reports when the API is connected", async () => {
  render(<HealthIndicator />);

  expect(await screen.findByText("API connected")).toBeInTheDocument();
});
