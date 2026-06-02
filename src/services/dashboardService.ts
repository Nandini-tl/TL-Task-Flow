import { App } from "@slack/bolt";

import {
  getTasks,
} from "./taskService";

export const publishDashboard =
  async (
    app: App,
    userId: string
  ) => {

    try {

      /*
        READ TASKS
      */

      const tasks: any =
        await getTasks();

      /*
        MANAGER TASKS ONLY
      */

      const dashboardTasks =

        tasks.filter(

          (task: any) => {

            /*
              ONLY ASSIGNER
            */

            if (
              task.assignedBy !==
              userId
            ) {

              return false;
            }

            /*
              REMOVE SINGLE TASKS
            */

            if (
              task.assignmentType ===
              "single"
            ) {

              return false;
            }

            /*
              REMOVE COMPLETED TASKS
            */

            if (
              task.status ===
              "completed"
            ) {

              return false;
            }

            return true;
          }
        );

      /*
        TOTAL
      */

      const totalTasks =
        dashboardTasks.length;

      /*
        BLOCKS
      */

      const blocks: any[] = [

        /*
          HEADER
        */

        {
          type:
            "header",

          text: {

            type:
              "plain_text",

            text:
              "📌 TASKFLOW MANAGER DASHBOARD",
          },
        },

        /*
          SUMMARY
        */

        {
          type:
            "section",

          fields: [

            {
              type:
                "mrkdwn",

              text:

                `📌 *Active Tasks*\n${totalTasks}`,
            },

            {
              type:
                "mrkdwn",

              text:

                `⏳ *Pending*\n${totalTasks}`,
            },
          ],
        },

        {
          type:
            "divider",
        },
      ];

      /*
        EMPTY STATE
      */

      if (
        dashboardTasks.length === 0
      ) {

        blocks.push({

          type:
            "section",

          text: {

            type:
              "mrkdwn",

            text:
              "📭 No Active Tasks",
          },
        });
      }

      /*
        TABLE HEADER
      */

      let tableText =

`TASK            PROGRESS   DEADLINE           PRIORITY   COMPLETED   PENDING
──────────────────────────────────────────────────────────────────────────────────\n`;

      /*
        TASK ROWS
      */

      for (
        const task of dashboardTasks
      ) {

        /*
          INVALID
        */

        if (
          !task.assignedUsers
        ) {

          continue;
        }

        /*
          COUNTS
        */

        const completedCount =

          task.assignedUsers

            .filter(
              (u: any) =>
                u.completed
            ).length;

        const totalUsers =

          task.assignedUsers
            .length;

        /*
          TASK NAME
        */

        const taskName =

          String(task.taskName)
            .substring(0, 14)
            .padEnd(15);

        /*
          PROGRESS
        */

        const progress =

          `${completedCount}/${totalUsers}`
            .padEnd(10);

        /*
          DEADLINE
        */

        const deadline =

          String(task.deadline)
            .substring(0, 18)
            .padEnd(18);

        /*
          PRIORITY
        */

        const priority =

          String(task.priority)
            .toUpperCase()
            .padEnd(10);

        /*
          COUNTS ONLY
        */

        const completed =

          String(
            task.assignedUsers.filter(
              (u: any) =>
                u.completed
            ).length
          ).padEnd(12);

        const pending =

          String(
            task.assignedUsers.filter(
              (u: any) =>
                !u.completed
            ).length
          );

        /*
          FINAL ROW
        */

        tableText +=

          `${taskName} ` +

          `${progress} ` +

          `${deadline} ` +

          `${priority} ` +

          `${completed} ` +

          `${pending}\n`;
      }

      /*
        TABLE BLOCK
      */

      blocks.push(

        {
          type:
            "section",

          text: {

            type:
              "mrkdwn",

            text:

              "```" +

              tableText +

              "```",
          },
        },

        {
          type:
            "divider",
        }
      );

      /*
        USER DETAILS
      */

      for (
        const task of dashboardTasks
      ) {

        /*
          COMPLETED USERS
        */

        const completedMentions =

          task.assignedUsers

            .filter(
              (u: any) =>
                u.completed
            )

            .map(
              (u: any) =>
                `<@${u.userId}>`
            )

            .join(" ");

        /*
          PENDING USERS
        */

        const pendingMentions =

          task.assignedUsers

            .filter(
              (u: any) =>
                !u.completed
            )

            .map(
              (u: any) =>
                `<@${u.userId}>`
            )

            .join(" ");

        /*
          COUNTS
        */

        const completedCount =

          task.assignedUsers

            .filter(
              (u: any) =>
                u.completed
            ).length;

        const totalUsers =

          task.assignedUsers
            .length;

        /*
          USER STATUS BLOCK
        */

        blocks.push(

          {
            type:
              "section",

            text: {

              type:
                "mrkdwn",

              text:

                `📝 *${task.taskName}*\n` +

                `📈 Progress: ${completedCount}/${totalUsers}\n\n` +

                `✅ *Completed*\n${

                  completedMentions ||
                  "None"
                }\n\n` +

                `⏳ *Pending*\n${

                  pendingMentions ||
                  "None"
                }`,
            },
          },

          {
            type:
              "divider",
          }
        );
      }

      /*
        PUBLISH
      */

      await app.client.views.publish({

        user_id:
          userId,

        view: {

          type:
            "home",

          blocks,
        },
      });

      console.log(
        "✅ DASHBOARD UPDATED"
      );

    } catch (error) {

      console.log(
        "❌ DASHBOARD ERROR:",
        error
      );
    }
  };