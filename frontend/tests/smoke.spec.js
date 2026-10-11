
import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

async function createTask(page, title = "Finish Final Project") {
  await page.getByPlaceholder("Enter task title").fill(title)
  await page.getByRole("button", { name: "Add Task" }).click()
}

test("Dashboard loads", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Task Management System" })
  ).toBeVisible()

  await expect(page.getByText("Total Tasks")).toBeVisible()
})

test("User can add a task", async ({ page }) => {
  await createTask(page)

  await expect(
    page.getByRole("heading", { name: "Finish Final Project" })
  ).toBeVisible()
})

test("Task persists after refresh", async ({ page }) => {
  await createTask(page)
  await page.reload()

  await expect(
    page.getByRole("heading", { name: "Finish Final Project" })
  ).toBeVisible()
})

test("User can search tasks", async ({ page }) => {
  await createTask(page, "Complete Documentation")
  await createTask(page, "Prepare Presentation")

  await page.getByPlaceholder("Search tasks...").fill("Documentation")

  await expect(
    page.getByRole("heading", { name: "Complete Documentation" })
  ).toBeVisible()

  await expect(
    page.getByRole("heading", { name: "Prepare Presentation" })
  ).toHaveCount(0)
})

test("User can update task status", async ({ page }) => {
  await createTask(page)

  await page
    .getByRole("combobox", { name: "Status for Finish Final Project" })
    .selectOption("Completed")

  await expect(
    page.getByRole("combobox", { name: "Status for Finish Final Project" })
  ).toHaveValue("Completed")
})

test("User can edit a task", async ({ page }) => {
  await createTask(page, "Original Task")

  await page.getByRole("button", { name: "Edit" }).click()

  await page
    .getByPlaceholder("Enter task title")
    .fill("Updated Task")

  await page.getByRole("button", { name: "Update Task" }).click()

  await expect(
    page.getByRole("heading", { name: "Updated Task" })
  ).toBeVisible()
})

test("User can delete a task", async ({ page }) => {
  await createTask(page, "Task to Delete")

  page.once("dialog", async (dialog) => {
    await dialog.accept()
  })

  await page.getByRole("button", { name: "Delete" }).click()

  await expect(
    page.getByRole("heading", { name: "Task to Delete" })
  ).toHaveCount(0)
})

test("User can filter tasks by status", async ({ page }) => {
  await createTask(page, "Pending Task")
  await createTask(page, "Completed Task")

  await page
    .getByRole("combobox", { name: "Status for Completed Task" })
    .selectOption("Completed")

  await page
    .getByRole("combobox", { name: "Filter by status" })
    .selectOption("Completed")

  await expect(
    page.getByRole("heading", { name: "Completed Task" })
  ).toBeVisible()

  await expect(
    page.getByRole("heading", { name: "Pending Task" })
  ).toHaveCount(0)
})

test("Task title is required", async ({ page }) => {
  await page.getByRole("button", { name: "Add Task" }).click()

  const titleInput = page.getByPlaceholder("Enter task title")

  const isInvalid = await titleInput.evaluate(
    (element) => !element.checkValidity()
  )

  expect(isInvalid).toBe(true)
})
