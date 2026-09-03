import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createTask, getTask, listCategories, type Category, updateTask } from "../../lib/api";

type TaskFormPageProps = { mode: "create" | "edit" };

export function TaskFormPage({ mode }: TaskFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const taskId = Number(id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    const taskRequest = mode === "edit" && Number.isInteger(taskId) ? getTask(taskId) : Promise.resolve(null);
    Promise.all([taskRequest, listCategories()])
      .then(([task, loadedCategories]) => {
        setCategories(loadedCategories);
        if (task) { setTitle(task.title); setDescription(task.description ?? ""); setCategoryId(task.category?.id.toString() ?? ""); }
      })
      .catch(() => setError("This task could not be loaded."))
      .finally(() => setIsLoading(false));
  }, [mode, taskId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setError("Enter a task title.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        await createTask({ title: normalizedTitle, description, category_id: categoryId ? Number(categoryId) : null });
      } else {
        await updateTask(taskId, { title: normalizedTitle, description, category_id: categoryId ? Number(categoryId) : null });
      }
      navigate("/");
    } catch {
      setError("The task could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <p aria-live="polite" className="status-message">Loading task...</p>;

  return (
    <section className="page-card narrow-card">
      <p className="eyebrow">Task form</p>
      <h1>{mode === "create" ? "Add a task" : "Edit task"}</h1>
      <form className="task-form" onSubmit={(event) => void submit(event)}>
        <label htmlFor="task-title">Title</label>
        <input autoFocus id="task-title" maxLength={200} onChange={(event) => setTitle(event.target.value)} required value={title} />
        <label htmlFor="task-description">Description <span className="optional">(optional)</span></label>
        <textarea id="task-description" maxLength={5000} onChange={(event) => setDescription(event.target.value)} rows={5} value={description} />
        <label htmlFor="task-category">Category <span className="optional">(optional)</span></label>
        <select id="task-category" onChange={(event) => setCategoryId(event.target.value)} value={categoryId}><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button className="button button--primary" disabled={isSaving} type="submit">{isSaving ? "Saving..." : "Save task"}</button><Link className="button button--secondary" to="/">Cancel</Link></div>
      </form>
    </section>
  );
}
