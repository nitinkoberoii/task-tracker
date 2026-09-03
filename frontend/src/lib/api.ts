const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export type HealthStatus = {
  status: "ok";
  service: "smart-task-tracker-api";
};

export type TaskStatus = "pending" | "completed";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  category: Category | null;
};

export type Category = { id: number; name: string; created_at: string };
export type Summary = { total: number; completed: number; remaining: number; completion_percentage: number };

export type TaskInput = {
  title: string;
  description?: string | null;
  category_id?: number | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw new Error("The request could not be completed. Please try again.");
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export function getHealth(): Promise<HealthStatus> {
  return request<HealthStatus>("/api/health");
}

export function listTasks(): Promise<Task[]> {
  return request<Task[]>("/api/tasks");
}

export function getTask(taskId: number): Promise<Task> {
  return request<Task>(`/api/tasks/${taskId}`);
}

export function createTask(input: TaskInput): Promise<Task> {
  return request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) });
}

export function updateTask(taskId: number, input: Partial<TaskInput> & { status?: TaskStatus }): Promise<Task> {
  return request<Task>(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteTask(taskId: number): Promise<void> {
  return request<void>(`/api/tasks/${taskId}`, { method: "DELETE" });
}

export function listCategories(): Promise<Category[]> { return request<Category[]>("/api/categories"); }
export function createCategory(name: string): Promise<Category> { return request<Category>("/api/categories", { method: "POST", body: JSON.stringify({ name }) }); }
export function getSummary(): Promise<Summary> { return request<Summary>("/api/tasks/summary"); }
