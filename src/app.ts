import dotenv from "dotenv";
import { App } from "@slack/bolt";

import { registerAssignCommand } from "./commands/assign";
import { registerMyTasksCommand } from "./commands/mytasks";
import { startReminderService } from "./services/remainderService";

import { buildTaskCard } from "./services/messageService";

import {
  readTasks,
  writeTasks,
} from "./utils/fileHelper";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  signingSecret:
    process.env.SLACK_SIGNING_SECRET!,
  port: 3000,
});

/*
  REGISTER COMMANDS
*/

registerAssignCommand(app);

registerMyTasksCommand(app);

startReminderService(app);

/*
  COMPLETE BUTTON HANDLER
*/

app.action(
  "complete_task",

  async ({ ack, body, client }) => {

    console.log("✅ BUTTON CLICKED");

    await ack();

    try {

      /*
        TASK ID
      */

      const taskId = Number(
        (body as any).actions[0].value
      );

      console.log("TASK ID:", taskId);

      /*
        READ TASKS
      */

      const tasks = readTasks();

      /*
        FIND TASK
      */

      const task = tasks.find(
        (t: any) => t.id === taskId
      );

      if (!task) {
        console.log("❌ TASK NOT FOUND");
        return;
      }

      /*
        ALREADY COMPLETED
      */

      if (task.status === "completed") {

        console.log(
          "⚠️ TASK ALREADY COMPLETED"
        );

        return;
      }

      /*
        UPDATE TASK STATUS
      */

      const updatedTasks = tasks.map(
        (t: any) => {

          if (t.id === taskId) {

            return {
              ...t,
              status: "completed",
            };
          }

          return t;
        }
      );

      /*
        SAVE UPDATED TASKS
      */

      writeTasks(updatedTasks);

      console.log("✅ TASK COMPLETED");

      /*
        UPDATE CARD
      */

      await client.chat.update({

        token: process.env.SLACK_BOT_TOKEN,

        channel:
          (body as any).channel.id,

        ts:
          (body as any).message.ts,

        text: "Task Completed",

        blocks: buildTaskCard({

          id: task.id,

          taskName: task.taskName,

          assignedBy: task.assignedBy,

          assignedTo: task.assignedTo,

          deadline: task.deadline,

          status: "completed",
        }),
      });

      console.log("✅ CARD UPDATED");

      /*
        OPEN MANAGER DM
      */

      const managerDM =
        await client.conversations.open({

          token:
            process.env.SLACK_BOT_TOKEN,

          users: task.assignedBy,
        });

      const managerChannel =
        managerDM.channel?.id;

      if (!managerChannel) {

        console.log(
          "❌ MANAGER DM FAILED"
        );

        return;
      }

      /*
        SEND MANAGER NOTIFICATION
      */

      await client.chat.postMessage({

        token:
          process.env.SLACK_BOT_TOKEN,

        channel: managerChannel,

        text:
          `✅ TASK COMPLETED\n\n` +
          `📝 Task: ${task.taskName}\n` +
          `👤 Completed By: <@${task.assignedTo}>`,
      });

      console.log(
        "✅ MANAGER NOTIFIED"
      );

    } catch (error) {

      console.log(
        "❌ BUTTON ERROR:",
        error
      );
    }
  }
);

/*
  START APP
*/

(async () => {

  await app.start();

  console.log(
    "⚡ Slack Bot Running on Port 3000"
  );

})();