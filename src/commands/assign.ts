import { App } from "@slack/bolt";
import { readTasks, writeTasks } from "../utils/fileHelper";

export const registerAssignCommand = (app: App) => {
  app.command("/assign", async ({ command, ack, respond }) => {
    try {
      await ack();

      const text = command.text;

      const parts = text.split("|");

      if (parts.length < 2) {
        await respond(
          "❌ Format: /assign @user Task Name | deadline"
        );
        return;
      }

      // Left side
      const firstPart = parts[0].trim();

      // Split words
      const words = firstPart.split(" ");

      // Username
      const assignedTo = words[0].replace("@", "");

      // Task name
      const taskName = words.slice(1).join(" ");

      // Deadline
      const deadline = parts[1].trim();

      // Read existing tasks
      const tasks = readTasks();

      // Create task
      const newTask = {
        id: tasks.length + 1,
        taskName,
        assignedBy: command.user_name,
        assignedTo,
        deadline,
        status: "pending",
        reminderSent: false,
      };

      tasks.push(newTask);

      writeTasks(tasks);

      // Success response
      await respond(
        `✅ Task Assigned Successfully\n\n` +
        `👤 Assigned To: ${assignedTo}\n` +
        `📝 Task: ${taskName}\n` +
        `⏰ Deadline: ${deadline}`
      );

    } catch (error) {
      console.error("Assign Error:", error);

      await respond("❌ Failed to assign task");
    }
  });
};