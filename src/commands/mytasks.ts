import { App } from "@slack/bolt";
import {
  getTasks,
} from "../services/taskService";

export const registerMyTasksCommand = (
  app: App
) => {

  app.command(
    "/mytasks",

    async ({
      command,
      ack,
      respond,
    }) => {

      try {

        await ack();

        /*
          READ TASKS
        */
        const tasks: any =
          await getTasks();

        /*
          FILTER USER TASKS
        */
        const userTasks =
          tasks.filter(
            (task: any) => {

              /*
                CHECK USER EXISTS
                IN ASSIGNED USERS
              */
              const assignedUser =
                task.assignedUsers?.find(
                  (user: any) =>
                    user.userId ===
                    command.user_id
                );

              /*
                ONLY SHOW
                PENDING TASKS
              */
              return (
                assignedUser &&
                assignedUser.completed === false &&
                String(
                  task.status || ""
                )
                  .trim()
                  .toLowerCase() ===
                  "pending"
              );
            }
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
          COLUMN WIDTHS
        */
        const ID_WIDTH = 10;
        const TASK_WIDTH = 50;
        const ASSIGNED_WIDTH = 15;
        const PRIORITY_WIDTH = 10;
        const DEADLINE_WIDTH = 18;

        /*
          HEADER
        */
        let message =
          "📋 *My Pending Tasks*\n\n```";

        message +=
          "ID".padEnd(ID_WIDTH) + " " +
          "TASK NAME".padEnd(TASK_WIDTH) + " " +
          "ASSIGNED BY".padEnd(ASSIGNED_WIDTH) + " " +
          "PRIORITY".padEnd(PRIORITY_WIDTH) + " " +
          "DEADLINE".padEnd(DEADLINE_WIDTH) +
          "\n";

        /*
          HEADER LINE
        */
        message +=
          "─".repeat(110) +
          "\n";

        /*
          TASK ROWS
        */
        userTasks.forEach(
          (task: any) => {

            const id =
              String(task.id || "")
                .slice(-8)
                .padEnd(
                  ID_WIDTH
                );

            const assignedBy =
              String(
                task.assignedByName ||
                "unknown"
              )
                .slice(0, 13)
                .padEnd(
                  ASSIGNED_WIDTH
                );

            const priority =
              String(
                task.priority || ""
              )
                .toUpperCase()
                .padEnd(
                  PRIORITY_WIDTH
                );

            const deadline =
              String(
                task.deadline || ""
              )
                .padEnd(
                  DEADLINE_WIDTH
                );

            /*
              WRAP TASK NAME
            */
            const words =
              String(
                task.taskName || ""
              ).split(" ");

            const taskLines:
              string[] = [];

            let currentLine =
              "";

            words.forEach(
              (word: string) => {

                if (
                  (
                    currentLine +
                    word
                  ).length <=
                  TASK_WIDTH - 1
                ) {

                  currentLine +=
                    word + " ";

                } else {

                  taskLines.push(
                    currentLine.trim()
                  );

                  currentLine =
                    word + " ";
                }
              }
            );

            if (
              currentLine.trim()
            ) {

              taskLines.push(
                currentLine.trim()
              );
            }

            /*
              FIRST LINE
            */
            message +=
              `${id} ${taskLines[0].padEnd(TASK_WIDTH)} ${assignedBy} ${priority} ${deadline}\n`;

            /*
              EXTRA LINES
            */
            for (
              let i = 1;
              i < taskLines.length;
              i++
            ) {

              message +=
                `${" ".repeat(ID_WIDTH + 1)} ${taskLines[i].padEnd(TASK_WIDTH)}\n`;
            }

            /*
              HORIZONTAL LINE
            */
            message +=
              "─".repeat(110) +
              "\n";
          }
        );

        /*
          FOOTER
        */
        message += "```";

        /*
          SEND RESPONSE
        */
        await respond(
          message
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