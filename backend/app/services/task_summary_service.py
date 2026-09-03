from fastapi import HTTPException, status
from groq import APIError, Groq, NotFoundError, RateLimitError

from app.config import get_settings
from app.models.task import Task

SYSTEM_PROMPT = """You are a concise task-management assistant. Summarize only the supplied tasks.
Call out overdue or due-today pending tasks, overall progress, and the next one to three
useful actions.
Do not invent dates, priorities, categories, or facts. Use short plain-text paragraphs or bullets.
"""


def _format_task(task: Task) -> str:
    category = task.category.name if task.category else "Uncategorized"
    due_date = task.due_date.isoformat() if task.due_date else "No due date"
    description = task.description.strip() if task.description else "No description"
    return (
        f"- Title: {task.title}\n"
        f"  Status: {task.status.value}\n"
        f"  Category: {category}\n"
        f"  Due date: {due_date}\n"
        f"  Description: {description}"
    )


def _create_client(api_key: str) -> Groq:
    return Groq(api_key=api_key)


def summarize_tasks(tasks: list[Task]) -> str:
    settings = get_settings()
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI summaries are not configured. Add GROQ_API_KEY to backend/.env "
                "and restart the API."
            ),
        )

    if not tasks:
        return "There are no tasks to summarize yet. Add a task to receive an AI summary."

    task_context = "\n".join(_format_task(task) for task in tasks)
    try:
        completion = _create_client(settings.groq_api_key).chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Tasks to summarize:\n{task_context}"},
            ],
            max_tokens=300,
            temperature=0.2,
        )
    except RateLimitError as error:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="The AI summary request limit was reached. Please try again shortly.",
        ) from error
    except NotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "The configured Groq model is unavailable. Set GROQ_MODEL=openai/gpt-oss-20b "
                "in backend/.env and restart the API."
            ),
        ) from error
    except APIError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI summary service is unavailable. Please try again.",
        ) from error

    summary = completion.choices[0].message.content if completion.choices else None
    if not summary or not summary.strip():
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI summary service returned no summary. Please try again.",
        )
    return summary.strip()
