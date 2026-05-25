import { App } from "@slack/bolt";
import { readTasks } from "../utils/fileHelper";

export const registerMyTasksCommand = (app: App) => {

  app.command(
    "/mytasks",

    async ({
      command,
      ack,
      respond,
    }) => {

      try {

        await ack();

        const tasks = readTasks();

        /*
          ONLY PENDING TASKS
        */

        const userTasks = tasks.filter(

          (task: any) =>

            task.assignedTo ===
              command.user_id &&

            task.status ===
              "pending"
        );

        /*
          NO TASKS
        */

        if (
          userTasks.length === 0
        ) {

          await respond(
            "📭 No pending tasks."
          );

          return;
        }

        /*
          FORMAT TASKS
        */

        const formattedTasks =
          userTasks
            .map(

              (task: any) =>

                `━━━━━━━━━━━━━━\n` +

                ` *Task ID:* ${task.id}\n` +

                ` *Task:* ${task.taskName}\n` +

                ` *Assigned By:* ${task.assignedByName}\n` +

                ` *Deadline:* ${task.deadline}\n` +

                ` *Status:* ${task.status}`
            )

            .join("\n\n");

        /*
          SEND RESPONSE
        */

        await respond(

          `📋 *Pending Tasks*\n\n${formattedTasks}`
        );

      } catch (error) {

        console.error(
          "❌ MyTasks Error:",
          error
        );

        await respond(
          "❌ Failed to fetch tasks"
        );
      }
    }
  );
};