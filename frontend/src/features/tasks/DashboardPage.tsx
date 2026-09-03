import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createCategory, deleteTask, getAiSummary, getSummary, listCategories, listTasks, reorderTasks, type Category, type Summary, type Task, updateTask } from "../../lib/api";

export function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [sortOrder, setSortOrder] = useState("created");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

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

  async function summarizeTasks() {
    setIsSummarizing(true);
    setAiError(null);
    try {
      setAiSummary((await getAiSummary()).summary);
    } catch (summaryError) {
      setAiSummary(null);
      setAiError(summaryError instanceof Error ? summaryError.message : "The AI summary could not be generated. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  }

  async function persistOrder(nextTasks: Task[]) {
    const previousTasks = tasks;
    setTasks(nextTasks);
    try {
      setTasks(await reorderTasks(nextTasks.map((task) => task.id)));
    } catch {
      setTasks(previousTasks);
      setError("The task order could not be saved. Please try again.");
    }
  }

  function dropTask(targetTaskId: number) {
    if (draggedTaskId === null || draggedTaskId === targetTaskId) return;
    const nextTasks = [...tasks];
    const draggedIndex = nextTasks.findIndex((task) => task.id === draggedTaskId);
    const [draggedTask] = nextTasks.splice(draggedIndex, 1);
    const targetIndex = nextTasks.findIndex((task) => task.id === targetTaskId);
    nextTasks.splice(targetIndex, 0, draggedTask);
    setDraggedTaskId(null);
    void persistOrder(nextTasks);
  }

  const visibleTasks = [...(categoryFilter === "all" ? tasks : tasks.filter((task) => task.category?.id === Number(categoryFilter)))].sort(
    (left, right) => sortOrder === "due" ? (left.due_date ?? "9999-12-31").localeCompare(right.due_date ?? "9999-12-31") : 0
  );

  const today = new Date().toISOString().slice(0, 10);
  const calendarDays = [...new Set(visibleTasks.filter((task) => task.due_date).map((task) => task.due_date!))].sort();
  const canReorder = categoryFilter === "all" && sortOrder === "created" && view === "list";

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
      <section className="ai-summary" aria-labelledby="ai-summary-heading">
        <div className="ai-summary__heading"><div><h2 id="ai-summary-heading">AI task summary</h2><p>Get a quick view of progress and next actions.</p></div><button className="button button--secondary" disabled={isSummarizing} onClick={() => void summarizeTasks()} type="button">{isSummarizing ? "Summarizing..." : "Summarize tasks"}</button></div>
        <p className="ai-summary__disclosure">Task titles, descriptions, categories, statuses, and due dates are sent to Groq only when you request a summary.</p>
        {aiError && <p className="form-error" role="alert">{aiError}</p>}
        {aiSummary && <p className="ai-summary__content" aria-live="polite">{aiSummary}</p>}
      </section>
      <div className="category-tools"><label htmlFor="category-filter">Category <select id="category-filter" onChange={(event) => setCategoryFilter(event.target.value)} value={categoryFilter}><option value="all">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label htmlFor="task-sort">Order <select id="task-sort" onChange={(event) => setSortOrder(event.target.value)} value={sortOrder}><option value="created">Recently created</option><option value="due">Due date</option></select></label><div className="view-toggle"><button aria-pressed={view === "list"} className="button button--secondary" onClick={() => setView("list")} type="button">List</button><button aria-pressed={view === "calendar"} className="button button--secondary" onClick={() => setView("calendar")} type="button">Calendar</button></div><div className="category-create"><label htmlFor="new-category">New category</label><input id="new-category" maxLength={80} onChange={(event) => setNewCategoryName(event.target.value)} value={newCategoryName} /><button className="button button--secondary" onClick={() => void addCategory()} type="button">Add category</button></div></div>
      {error && <div className="message message--error" role="alert"><p>{error}</p><button className="button button--secondary" onClick={() => void loadTasks()} type="button">Try again</button></div>}
      {isLoading && <p aria-live="polite" className="status-message">Loading tasks...</p>}
      {canReorder && visibleTasks.length > 1 && <p className="reorder-hint">Drag a task card onto another card to reorder the list. Order is saved automatically.</p>}
      {!isLoading && !error && tasks.length === 0 && <div className="empty-state"><h2>No tasks yet</h2><p>Add your first task to get started.</p><Link className="button button--primary" to="/tasks/new">Add your first task</Link></div>}
      {!isLoading && tasks.length > 0 && visibleTasks.length === 0 && <div className="empty-state"><h2>No matching tasks</h2><p>Try another category or choose All categories.</p></div>}
      {!isLoading && view === "calendar" && visibleTasks.length > 0 && <div className="calendar-view" aria-label="Due date calendar">{calendarDays.length === 0 ? <p>No due dates yet. Add one while editing a task.</p> : calendarDays.map((day) => <section key={day}><h2>{day === today ? "Today" : day}</h2><ul>{visibleTasks.filter((task) => task.due_date === day).map((task) => <li key={task.id}>{task.title} {task.category && <span>({task.category.name})</span>}</li>)}</ul></section>)}</div>}
      {!isLoading && view === "list" && visibleTasks.length > 0 && <ul className="task-list" aria-label="Tasks">
        {visibleTasks.map((task) => <li className={`task-item ${task.status === "completed" ? "task-item--completed" : ""}`} draggable={canReorder} key={task.id} onDragOver={(event) => event.preventDefault()} onDragStart={() => setDraggedTaskId(task.id)} onDrop={() => dropTask(task.id)}>
          <label className="task-toggle"><input checked={task.status === "completed"} onChange={() => void toggleTask(task)} type="checkbox" /><span><strong>{task.title}</strong>{task.category && <em className="category-badge">{task.category.name}</em>}{task.due_date && <em className={`due-badge ${task.status !== "completed" && task.due_date < today ? "due-badge--overdue" : task.due_date === today ? "due-badge--today" : ""}`}>{task.status !== "completed" && task.due_date < today ? "Overdue: " : task.due_date === today ? "Due today" : `Due: ${task.due_date}`}</em>}{task.description && <small>{task.description}</small>}</span></label>
          <div className="task-actions"><Link className="text-button" to={`/tasks/${task.id}/edit`}>Edit</Link><button className="text-button text-button--danger" onClick={() => void removeTask(task)} type="button">Delete</button></div>
        </li>)}
      </ul>}
    </section>
  );
}
