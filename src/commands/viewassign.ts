import { App } from "@slack/bolt";
import {
  getTasks,
} from "../services/taskService";

export const registerViewAssignCommand = (
  app: App
) => {

  app.command(
    "/viewassign",

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
          FILTER TASKS
        */
        const pendingTasks =
          tasks.filter(
            (task: any) => {

              const assignedBy =
                String(
                  task.assignedBy || ""
                ).trim();

              const currentUser =
                String(
                  command.user_id
                ).trim();

              const status =
                String(
                  task.status || ""
                )
                  .trim()
                  .toLowerCase();

              return (
                assignedBy ===
                  currentUser &&
                status ===
                  "pending"
              );
            }
          );

        /*
          NO TASKS
        */
        if (
          pendingTasks.length === 0
        ) {

          await respond(
            "📭 No pending assigned tasks found."
          );

          return;
        }

        /*
          COLUMN WIDTHS
        */
        const ID_WIDTH = 10;
        const TASK_WIDTH = 50;
        const USER_WIDTH = 25;
        const PRIORITY_WIDTH = 10;
        const STATUS_WIDTH = 10;
        const DEADLINE_WIDTH = 18;

        /*
          TABLE TOTAL WIDTH
        */
        const TABLE_WIDTH =
          ID_WIDTH +
          TASK_WIDTH +
          USER_WIDTH +
          PRIORITY_WIDTH +
          STATUS_WIDTH +
          DEADLINE_WIDTH +
          10;

        /*
          HEADER
        */
        let message =
          "📋 *Pending Assigned Tasks*\n\n```";

        message +=
          "ID".padEnd(ID_WIDTH) + " " +
          "TASK NAME".padEnd(TASK_WIDTH) + " " +
          "USER".padEnd(USER_WIDTH) + " " +
          "PRIORITY".padEnd(PRIORITY_WIDTH) + " " +
          "STATUS".padEnd(STATUS_WIDTH) + " " +
          "DEADLINE".padEnd(DEADLINE_WIDTH) +
          "\n";

        /*
          HEADER LINE
        */
        message +=
          "─".repeat(TABLE_WIDTH) +
          "\n";

        /*
          TABLE ROWS
        */
        pendingTasks.forEach(
          (task: any) => {

            /*
              TASK ID
            */
            const id =
              String(task.id || "")
                .slice(-8)
                .padEnd(ID_WIDTH);

            /*
              TASK NAME
            */
            const taskName =
              String(
                task.taskName || ""
              );

            /*
              GET USER NAMES
            */
            const userNames =

              task.assignedUsers?.map(
                (user: any) =>
                  user.userName
              ).join(", ") ||

              "unknown";

            /*
              USER COLUMN
            */
            const user =
              String(userNames)
                .slice(0, 23)
                .padEnd(
                  USER_WIDTH
                );

            /*
              PRIORITY
            */
            const priority =
              String(
                task.priority || ""
              )
                .toUpperCase()
                .padEnd(
                  PRIORITY_WIDTH
                );

            /*
              STATUS
            */
            const status =
              String(
                task.status || ""
              )
                .toUpperCase()
                .padEnd(
                  STATUS_WIDTH
                );

            /*
              DEADLINE
            */
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
              taskName.split(" ");

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
                  ).length <
                  TASK_WIDTH - 2
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

            /*
              PUSH LAST LINE
            */
            if (
              currentLine
            ) {

              taskLines.push(
                currentLine.trim()
              );
            }

            /*
              FIRST ROW
            */
            message +=
              `${id} ${taskLines[0].padEnd(TASK_WIDTH)} ${user} ${priority} ${status} ${deadline}\n`;

            /*
              EXTRA TASK LINES
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
              ROW SEPARATOR
            */
            message +=
              "─".repeat(
                TABLE_WIDTH
              ) + "\n";
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
          "❌ View Assign Error:",
          error
        );

        await respond(
          "❌ Failed to fetch assigned tasks."
        );
      }
    }
  );
};