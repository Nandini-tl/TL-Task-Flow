import { App } from "@slack/bolt";
import { readTasks } from "../utils/fileHelper";

export const registerMyTasksCommand = (app: App) => {
  app.command("/mytasks", async ({ command, ack, respond }) => {
    try {
      await ack();

      const tasks = readTasks();

      // Current user's tasks
      const userTasks = tasks.filter(
        (task: any) =>
          task.assignedTo === command.user_id
      );

      if (userTasks.length === 0) {
        await respond("📭 No tasks assigned.");
        return;
      }

      const formattedTasks = userTasks
        .map(
          (task: any) =>
            `🆔 *Task ID:* ${task.id}\n` +
            `📝 *Task:* ${task.taskName}\n` +
            `👤 *Assigned By:* ${task.assignedByName}\n` +
            `📌 *Status:* ${task.status}\n` +
            `⏰ *Deadline:* ${task.deadline}`
        )
        .join("\n\n━━━━━━━━━━━━━━\n\n");

      await respond(
        `📋 *Your Tasks*\n\n${formattedTasks}`
      );

    } catch (error) {
      console.error("❌ MyTasks Error:", error);

      await respond("❌ Failed to fetch tasks");
    }
  });
};