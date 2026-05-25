import dotenv from "dotenv";
import { App } from "@slack/bolt";

import { registerAssignCommand } from "./commands/assign";
import { registerMyTasksCommand } from "./commands/mytasks";
import { registerCompleteCommand } from "./commands/complete";
import { startReminderService } from "./services/remainderService";
import { buildTaskCard } from "./services/messageService";
import { readTasks, writeTasks } from "./utils/fileHelper";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  port: 3000,
});

registerAssignCommand(app);
registerMyTasksCommand(app);
registerCompleteCommand(app);
startReminderService(app);
app.action(
  "complete_task",

  async ({ ack, body, client }) => {

    await ack();

    try {

      /*
        Get Task ID From Button
      */

      const taskId = Number(
        (body as any).actions[0].value
      );

      console.log("TASK ID:", taskId);

      /*
        Read Tasks
      */

      const tasks = readTasks();

      /*
        Find Task
      */

      const task = tasks.find(
        (t: any) => t.id === taskId
      );

      if (!task) {
        return;
      }

      /*
        Prevent Duplicate Completion
      */

      if (task.status === "completed") {
        return;
      }

      /*
        Update Status
      */

      task.status = "completed";

      /*
        Save Tasks
      */

      writeTasks(tasks);

      console.log("✅ TASK COMPLETED");

      /*
        UPDATE ORIGINAL MESSAGE
      */

      await client.chat.update({

        token: process.env.SLACK_BOT_TOKEN,

        channel: (body as any).channel.id,

        ts: (body as any).message.ts,

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

      /*
        NOTIFY MANAGER
      */

      await client.chat.postMessage({

        token: process.env.SLACK_BOT_TOKEN,

        channel: task.assignedBy,

        text:
          `✅ Task Completed\n\n` +
          `📝 ${task.taskName}\n` +
          `👤 Completed By: <@${task.assignedTo}>`,
      });

      console.log("✅ MANAGER NOTIFIED");

    } catch (error) {

      console.log(
        "❌ BUTTON ERROR:",
        error
      );
    }
  }
);

(async () => {
  await app.start();

  console.log("⚡ Slack Bot Running on Port 3000");
})();