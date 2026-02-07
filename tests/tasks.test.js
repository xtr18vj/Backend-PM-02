const request = require("supertest");
const app = require("../app");

describe("Tasks API validations", () => {
  it("rejects short title", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Hi", priority: "HIGH", created_by: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it("rejects invalid priority", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Valid Title", priority: "URGENT", created_by: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/priority/i);
  });

  it("rejects non-integer created_by", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Valid Title", priority: "HIGH", created_by: "abc" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/created_by/i);
  });

  it("rejects invalid due_date format", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({
        title: "Valid Title",
        priority: "HIGH",
        created_by: 1,
        due_date: "2026/02/07",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/due_date/i);
  });

  it("accepts valid task", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({
        title: "Valid Title",
        priority: "HIGH",
        created_by: 1,
        due_date: "2026-02-07",
      });
    expect(res.status).toBe(201);
    expect(res.body.task_id).toBeDefined();
  });

  it("creates, updates, and deletes a subtask", async () => {
    const taskRes = await request(app)
      .post("/tasks")
      .send({
        title: "Task for subtask",
        priority: "LOW",
        created_by: 1,
      });
    expect(taskRes.status).toBe(201);
    const taskId = taskRes.body.task_id;

    const createRes = await request(app)
      .post(`/tasks/${taskId}/subtasks`)
      .send({ title: "Subtask 1" });
    expect(createRes.status).toBe(201);
    const subtaskId = createRes.body.subtask_id;

    const updateRes = await request(app)
      .patch(`/tasks/subtasks/${subtaskId}`)
      .send({ title: "Subtask 1 updated" });
    expect(updateRes.status).toBe(200);

    const deleteRes = await request(app).delete(
      `/tasks/subtasks/${subtaskId}`
    );
    expect(deleteRes.status).toBe(200);
  });
});
