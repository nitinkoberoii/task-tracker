import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createCategory, deleteTask, getSummary, listCategories, listTasks, type Category, type Summary, type Task, updateTask } from "../../lib/api";

export function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [newCategoryName, setNewCategoryName] = useState("");

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedTasks, loadedCategories, loadedSummary] = await Promise.all([listTasks(), listCategories(), getSummary()]);
      setTasks(loadedTasks);
      setCategories(loadedCategories);
      setSummary(loadedSummary);
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
      setSummary(await getSummary());
    } catch {
      setError("The task status could not be changed. Please try again.");
    }
  }

  async function removeTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    try {
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setSummary(await getSummary());
    } catch {
      setError("The task could not be deleted. Please try again.");
    }
  }

  async function addCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      const category = await createCategory(name);
      setCategories((current) => [...current, category].sort((left, right) => left.name.localeCompare(right.name)));
      setNewCategoryName("");
    } catch {
      setError("The category could not be created. Category names must be unique.");
    }
  }

  const visibleTasks = categoryFilter === "all" ? tasks : tasks.filter((task) => task.category?.id === Number(categoryFilter));

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
      {summary && <div className="summary-grid" aria-label="Task summary"><div><span>Total</span><strong>{summary.total}</strong></div><div><span>Completed</span><strong>{summary.completed}</strong></div><div><span>Remaining</span><strong>{summary.remaining}</strong></div><div><span>Progress</span><strong>{summary.completion_percentage}%</strong></div></div>}
      <div className="category-tools"><label htmlFor="category-filter">Category <select id="category-filter" onChange={(event) => setCategoryFilter(event.target.value)} value={categoryFilter}><option value="all">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><div className="category-create"><label htmlFor="new-category">New category</label><input id="new-category" maxLength={80} onChange={(event) => setNewCategoryName(event.target.value)} value={newCategoryName} /><button className="button button--secondary" onClick={() => void addCategory()} type="button">Add category</button></div></div>
      {error && <div className="message message--error" role="alert"><p>{error}</p><button className="button button--secondary" onClick={() => void loadTasks()} type="button">Try again</button></div>}
      {isLoading && <p aria-live="polite" className="status-message">Loading tasks...</p>}
      {!isLoading && !error && tasks.length === 0 && <div className="empty-state"><h2>No tasks yet</h2><p>Add your first task to get started.</p><Link className="button button--primary" to="/tasks/new">Add your first task</Link></div>}
      {!isLoading && tasks.length > 0 && visibleTasks.length === 0 && <div className="empty-state"><h2>No matching tasks</h2><p>Try another category or choose All categories.</p></div>}
      {!isLoading && visibleTasks.length > 0 && <ul className="task-list" aria-label="Tasks">
        {visibleTasks.map((task) => <li className={`task-item ${task.status === "completed" ? "task-item--completed" : ""}`} key={task.id}>
          <label className="task-toggle"><input checked={task.status === "completed"} onChange={() => void toggleTask(task)} type="checkbox" /><span><strong>{task.title}</strong>{task.category && <em className="category-badge">{task.category.name}</em>}{task.description && <small>{task.description}</small>}</span></label>
          <div className="task-actions"><Link className="text-button" to={`/tasks/${task.id}/edit`}>Edit</Link><button className="text-button text-button--danger" onClick={() => void removeTask(task)} type="button">Delete</button></div>
        </li>)}
      </ul>}
    </section>
  );
}
