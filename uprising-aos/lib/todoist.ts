export async function fetchTodoistTasks() {
  const TODOIST_API_KEY = process.env.TODOIST_API_KEY

  if (!TODOIST_API_KEY) {
    return []
  }

  try {
    const res = await fetch('https://api.todoist.com/rest/v2/tasks?filter=today%20|%20overdue', {
      headers: {
        'Authorization': `Bearer ${TODOIST_API_KEY}`
      },
      // Revalidate frequently or don't cache
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      console.error('Todoist API error:', res.statusText)
      return []
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
  } catch (error) {
    console.error('Failed to fetch Todoist tasks:', error)
    return []
  }
}
