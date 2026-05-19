import { App } from "@slack/bolt";
import { readTasks, writeTasks } from "../utils/fileHelper";

export const registerCompleteCommand = (app: App) => {
  app.command("/complete", async ({ command, ack, respond }) => {
    try {
      await ack();

      // Get task ID from command
      const taskId = Number(command.text);

      // Validate task ID
      if (isNaN(taskId)) {
        await respond(
          "❌ Format: /complete taskId"
        );
        return;
      }

      // Current Slack username
      const currentUser = command.user_name;

      // Read tasks
      const tasks = readTasks();

      // Find task
      const task = tasks.find(
        (t: any) => t.id === taskId
      );

      // Task not found
      if (!task) {
        await respond("❌ Task not found");
        return;
      }

      // Check ownership
      if (task.assignedTo !== currentUser) {
        await respond(
          "❌ You are not assigned to this task"
        );
        return;
      }

      // Already completed
      if (task.status === "completed") {
        await respond(
          "⚠️ Task already completed"
        );
        return;
      }

      // Update status
      task.status = "completed";

      // Save updated tasks
      writeTasks(tasks);

      // Notify manager (optional)
      // Currently using username storage

      // Success response
      await respond(
        `✅ Task Completed Successfully\n\n` +
        `🆔 ${task.id}\n` +
        `📝 ${task.taskName}`
      );

    } catch (error) {
      console.error("Complete Error:", error);

      await respond("❌ Failed to complete task");
    }
  });
};