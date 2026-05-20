import { App } from "@slack/bolt";
import { readTasks, writeTasks } from "../utils/fileHelper";
import { buildTaskCard } from "../services/messageService";

export const registerAssignCommand = (app: App) => {
  app.command("/assign", async ({ command, ack, respond }) => {
    try {
      await ack();

      /*
        Example:
        /assign @nandini Build Dashboard | 2026-05-20 10:30
      */

      const text = command.text.trim();

      const parts = text.split("|");

      // Validate
      if (parts.length !== 2) {
        await respond(
          "❌ Format:\n/assign @user Task Name | YYYY-MM-DD HH:mm"
        );
        return;
      }

      const leftPart = parts[0].trim();

      const deadline = parts[1].trim();

      // Split words
      const words = leftPart.split(" ");

      // Username
      const username = words[0]
        .replace("@", "")
        .trim();

      // Task name
      const taskName = words
        .slice(1)
        .join(" ")
        .trim();

      // Validate
      if (!username || !taskName) {
        await respond("❌ Invalid command format");
        return;
      }

      /*
        Find Slack User
      */

      const usersResponse =
        await app.client.users.list({
          token: process.env.SLACK_BOT_TOKEN,
        });

      const users = usersResponse.members || [];

      const slackUser = users.find(
        (user: any) =>
          user.name?.toLowerCase() ===
          username.toLowerCase()
      );

      if (!slackUser?.id) {
        await respond(
          `❌ Slack user "${username}" not found`
        );
        return;
      }

      // Slack User ID
      const assignedTo = slackUser.id;

      // Read tasks
      const tasks = readTasks();

      // Create task
      const newTask = {
        id: Date.now(),

        taskName,

        assignedBy: command.user_id,
        assignedByName: command.user_name,

        assignedTo,
        assignedToName: username,

        deadline,

        status: "pending",

        reminderSent: false,

        overdueSent: false,
      };

      // Save task
      tasks.push(newTask);

      writeTasks(tasks);

      console.log("✅ TASK CREATED");
      console.log(newTask);

      /*
        Send DM To Assigned User
      */

      // await app.client.chat.postMessage({
      //   token: process.env.SLACK_BOT_TOKEN,

      //   channel: assignedTo,

      //   text:
      //     `📌 *New Task Assigned*\n\n` +
      //     `📝 *Task:* ${taskName}\n` +
      //     `⏰ *Deadline:* ${deadline}\n` +
      //     `👤 *Assigned By:* @${command.user_name}`,
      // });/
      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,

        channel: assignedTo,

        text: "New Task Assigned",

        blocks: buildTaskCard({
          id: newTask.id,
          taskName,
          assignedBy: command.user_id,
          assignedTo,
          deadline,
          status: "pending",
        }),
      });

      /*
        Success Response To Manager
      */

      await respond(
        `✅ *Task Sent Successfully*\n\n` +
        `👤 *Assigned To:* @${username}\n` +
        `📝 *Task:* ${taskName}\n` +
        `⏰ *Deadline:* ${deadline}`
      );

    } catch (error) {
      console.error("❌ Assign Error:", error);

      await respond("❌ Failed to assign task");
    }
  });
};