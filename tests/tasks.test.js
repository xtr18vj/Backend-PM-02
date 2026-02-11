const path = require("path");
const fs = require("fs");

const TEST_DB_PATH = path.join(__dirname, "..", "database", "test.db");
process.env.DB_PATH = TEST_DB_PATH;

if (fs.existsSync(TEST_DB_PATH)) {
  fs.unlinkSync(TEST_DB_PATH);
}

const request = require("supertest");
const app = require("../src/app");
const { close } = require("../src/config/database");

describe("Tasks API", () => {
  afterAll(async () => {
    await close();
  });

  test("creates a task", async () => {
    const res = await request(app).post("/api/tasks").send({
      title: "First task",
      status: "TODO",
      priority: "HIGH",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("First task");
    expect(res.body.data.status).toBe("TODO");
  });

  test("lists tasks", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("updates task status with valid transition", async () => {
    const create = await request(app).post("/api/tasks").send({
      title: "Status update task",
      status: "TODO",
      priority: "MEDIUM",
    });
    const taskId = create.body.data.id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ status: "IN_PROGRESS" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("IN_PROGRESS");
  });

  test("rejects invalid status transition", async () => {
    const create = await request(app).post("/api/tasks").send({
      title: "Bad transition task",
      status: "TODO",
      priority: "MEDIUM",
    });
    const taskId = create.body.data.id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ status: "COMPLETED" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("creates subtask under a task", async () => {
    const create = await request(app).post("/api/tasks").send({
      title: "Parent task",
      status: "TODO",
      priority: "LOW",
    });
    const taskId = create.body.data.id;

    const res = await request(app)
      .post(`/api/tasks/${taskId}/subtasks`)
      .send({
        title: "Sub task",
        status: "TODO",
        priority: "MEDIUM",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task_id).toBe(taskId);
  });
});
