import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createTask, getTask, updateTask } from "../../lib/api";

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

  useEffect(() => {
    if (mode !== "edit" || !Number.isInteger(taskId)) return;
    getTask(taskId)
      .then((task) => {
        setTitle(task.title);
        setDescription(task.description ?? "");
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
        await createTask({ title: normalizedTitle, description });
      } else {
        await updateTask(taskId, { title: normalizedTitle, description });
      }
      navigate("/");
    } catch {
      setError("The task could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <p className="status-message">Loading task...</p>;

  return (
    <section className="page-card narrow-card">
      <p className="eyebrow">Task form</p>
      <h1>{mode === "create" ? "Add a task" : "Edit task"}</h1>
      <form className="task-form" onSubmit={(event) => void submit(event)}>
        <label htmlFor="task-title">Title</label>
        <input autoFocus id="task-title" maxLength={200} onChange={(event) => setTitle(event.target.value)} required value={title} />
        <label htmlFor="task-description">Description <span className="optional">(optional)</span></label>
        <textarea id="task-description" maxLength={5000} onChange={(event) => setDescription(event.target.value)} rows={5} value={description} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button className="button button--primary" disabled={isSaving} type="submit">{isSaving ? "Saving..." : "Save task"}</button><Link className="button button--secondary" to="/">Cancel</Link></div>
      </form>
    </section>
  );
}
