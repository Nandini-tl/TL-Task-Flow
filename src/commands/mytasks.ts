import { App } from "@slack/bolt";
import { readTasks } from "../utils/fileHelper";

export const registerMyTasksCommand = (app: App) => {
  app.command("/mytasks", async ({ command, ack, respond }) => {
    try {
      await ack();

      // Current Slack username
      const currentUser = command.user_name;

      // Read tasks
      const tasks = readTasks();

      // Filter tasks for current user
      const userTasks = tasks.filter(
        (task: any) =>
          task.assignedTo === currentUser
      );

      // No tasks
      if (userTasks.length === 0) {
        await respond("📭 No tasks assigned.");
        return;
      }

      // Build response
      const message = userTasks
        .map(
          (task: any) =>
            `🆔 ${task.id}\n` +
            `📝 ${task.taskName}\n` +
            `⏰ ${task.deadline}\n` +
            `📌 ${task.status}\n`
        )
        .join("\n");

      // Send response
      await respond(message);

    } catch (error) {
      console.error("MyTasks Error:", error);

      await respond("❌ Failed to fetch tasks");
    }
  });
};