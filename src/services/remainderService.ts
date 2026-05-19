import { App } from "@slack/bolt";
import cron from "node-cron";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { readTasks, writeTasks } from "../utils/fileHelper";

// Enable custom date parsing
dayjs.extend(customParseFormat);

export const startReminderService = (app: App) => {
  console.log("✅ Reminder Service Started");

  // Runs every minute
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Checking reminders...");

    const tasks = readTasks();

    let updated = false;

    for (const task of tasks) {
      try {
        // Skip completed tasks
        if (task.status === "completed") {
          continue;
        }

        console.log("📌 Task:", task.taskName);

        // Current time
        const now = dayjs();

        // Parse deadline
        const deadline = dayjs(
          task.deadline,
          "YYYY-MM-DD HH:mm"
        );

        console.log(
          "🕒 Current Time:",
          now.format("YYYY-MM-DD HH:mm")
        );

        console.log(
          "⏳ Deadline:",
          deadline.format("YYYY-MM-DD HH:mm")
        );

        // Difference in minutes
        const diff = deadline.diff(now, "minute");

        console.log("⌛ Diff:", diff);

        /*
          Reminder Logic
          Sends reminder when task is due within 5 mins
        */

        if (
            diff <= 60 &&
            diff >= 0 &&
            !task.reminderSent
            ) {
            try {
                console.log("🚀 Sending reminder...");
                console.log("USER:", task.assignedTo);

                const response = await app.client.chat.postMessage({
                token: process.env.SLACK_BOT_TOKEN,
                channel: task.assignedTo,
                text:
                    `⏰ *Task Reminder*\n\n` +
                    `📌 Task: ${task.taskName}\n` +
                    `🕒 Deadline: ${task.deadline}`,
                });

                console.log("✅ Reminder Sent");
                console.log(response);

                task.reminderSent = true;
                updated = true;

            } catch (error: any) {
                console.log("❌ SLACK ERROR:");
                console.log(error.data || error);
            }
            }

        /*
          Overdue Logic
        */

        if (
          now.isAfter(deadline) &&
          !task.overdueSent
        ) {
          console.log("⚠️ Sending overdue alert...");

          // Notify assignee
          await app.client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            channel: task.assignedTo,
            text:
              `❌ *Task Overdue*\n\n` +
              `📌 Task: ${task.taskName}`,
          });

          // Notify manager
          await app.client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            channel: task.assignedBy,
            text:
              `⚠️ Assigned task overdue\n\n` +
              `📌 Task: ${task.taskName}`,
          });

          console.log("✅ Overdue Alert Sent");

          task.overdueSent = true;
          updated = true;
        }
      } catch (error) {
        console.log("❌ Reminder Error:", error);
      }
    }

    // Save updates
    if (updated) {
      writeTasks(tasks);
    }
  });
};