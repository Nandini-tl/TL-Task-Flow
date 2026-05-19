import { App } from "@slack/bolt";
import { readTasks, writeTasks } from "../utils/fileHelper";

export const registerCompleteCommand = (app: App) => {
  app.command("/complete", async ({ command, ack, respond }) => {
    try {
      await ack();

      const taskId = Number(command.text.trim());

      // Validate
      if (!taskId) {
        await respond(
          "❌ Format:\n/complete taskId"
        );
        return;
      }

      // Read tasks
      const tasks = readTasks();

      // Find task
      const task = tasks.find(
        (t: any) => t.id === taskId
      );

      if (!task) {
        await respond("❌ Task not found");
        return;
      }

      // Only assigned user can complete
      if (task.assignedTo !== command.user_id) {
        await respond(
          "❌ You are not assigned to this task"
        );
        return;
      }

      // Already completed
      if (task.status === "completed") {
        await respond(
          "✅ Task already completed"
        );
        return;
      }

      // Mark completed
      task.status = "completed";

      // Save
      writeTasks(tasks);

      console.log("✅ TASK COMPLETED");

      /*
        Notify Manager
      */

      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,

        channel: task.assignedBy,

        text:
          `✅ *Task Completed*\n\n` +
          `📝 *Task:* ${task.taskName}\n` +
          `👤 *Completed By:* <@${command.user_id}>`,
      });

      /*
        Success Response
      */

      await respond(
        `✅ Task Completed Successfully`
      );

    } catch (error) {
      console.error("❌ Complete Error:", error);

      await respond(
        "❌ Failed to complete task"
      );
    }
  });
};