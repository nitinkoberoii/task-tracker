import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteTask, listTasks, type Task, updateTask } from "../../lib/api";

export function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setTasks(await listTasks());
    } catch {
      setError("Tasks could not be loaded. Confirm that the API is running, then try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => void loadTasks(), 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadTasks]);

  async function toggleTask(task: Task) {
    try {
      const updated = await updateTask(task.id, { status: task.status === "completed" ? "pending" : "completed" });
      setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      setError("The task status could not be changed. Please try again.");
    }
  }

  async function removeTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    try {
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch {
      setError("The task could not be deleted. Please try again.");
    }
  }

  return (
    <section className="page-card">
      <div className="page-heading">
        <div>
          <h1>Your tasks</h1>
          <p>Create tasks, keep them current, and mark them done.</p>
        </div>
        <Link className="button button--primary" to="/tasks/new">
          Add task
        </Link>
      </div>
      {error && <div className="message message--error" role="alert"><p>{error}</p><button className="button button--secondary" onClick={() => void loadTasks()} type="button">Try again</button></div>}
      {isLoading && <p className="status-message">Loading tasks...</p>}
      {!isLoading && !error && tasks.length === 0 && <div className="empty-state"><h2>No tasks yet</h2><p>Add your first task to get started.</p><Link className="button button--primary" to="/tasks/new">Add your first task</Link></div>}
      {!isLoading && tasks.length > 0 && <ul className="task-list" aria-label="Tasks">
        {tasks.map((task) => <li className={`task-item ${task.status === "completed" ? "task-item--completed" : ""}`} key={task.id}>
          <label className="task-toggle"><input checked={task.status === "completed"} onChange={() => void toggleTask(task)} type="checkbox" /><span><strong>{task.title}</strong>{task.description && <small>{task.description}</small>}</span></label>
          <div className="task-actions"><Link className="text-button" to={`/tasks/${task.id}/edit`}>Edit</Link><button className="text-button text-button--danger" onClick={() => void removeTask(task)} type="button">Delete</button></div>
        </li>)}
      </ul>}
    </section>
  );
}
