export async function fetchTodoistTasks(): Promise<{ id: string; content: string; description: string; isCompleted: boolean; due: string | null; priority: number }[] | null> {
  const TODOIST_API_KEY = process.env.TODOIST_API_KEY

  if (!TODOIST_API_KEY) {
    return null
  }

  try {
    const res = await fetch('https://api.todoist.com/rest/v2/tasks?filter=today%20|%20overdue', {
      headers: {
        'Authorization': `Bearer ${TODOIST_API_KEY}`
      },
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      return null
    }

    const tasks = await res.json()
    return tasks.map((t: any) => ({
      id: t.id,
      content: t.content,
      description: t.description,
      isCompleted: t.is_completed,
      due: t.due ? t.due.date : null,
      priority: t.priority
    }))
  } catch {
    return null
  }
}
