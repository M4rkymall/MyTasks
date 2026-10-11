const API_URL = "/api/tasks"

function fromApi(task) {
  return {
    ...task,
    dueDate: task.due_date ?? task.dueDate ?? "",
    assignedTo: task.assigned_to ?? task.assignedTo ?? "",
    createdAt: task.created_at ?? task.createdAt ?? ""
  }
}

function toApi(task) {
  return {
    title: task.title,
    description: task.description || "",
    status: task.status || "Pending",
    priority: task.priority || "Medium",
    due_date: task.dueDate || null,
    assigned_to: task.assignedTo || null
  }
}

async function request(path = "", options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  })
  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`)
  }
  return payload
}

export async function getTasks() {
  const tasks = await request()
  return tasks.map(fromApi)
}

export async function addTask(task) {
  return fromApi(await request("", {
    method: "POST",
    body: JSON.stringify(toApi(task))
  }))
}

export async function updateTask(id, changes) {
  // API updates are full-record updates, so merge with the current record first.
  const current = (await getTasks()).find((task) => String(task.id) === String(id))
  if (!current) throw new Error("Task not found")
  const merged = { ...current, ...changes }
  return fromApi(await request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApi(merged))
  }))
}

export async function deleteTask(id) {
  return request(`/${id}`, { method: "DELETE" })
}
