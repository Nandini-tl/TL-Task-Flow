import { App } from "@slack/bolt";

import {
  readTasks,
} from "../utils/fileHelper";

export const publishDashboard =
  async (
    app: App,
    userId: string
  ) => {

    try {

      /*
        READ TASKS
      */

      const tasks =
        readTasks();

      /*
        ONLY TEAM TASKS
      */

      const dashboardTasks =

        tasks.filter(

          (task: any) =>

            task.assignmentType !==
            "single"
        );

      /*
        BUILD BLOCKS
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
              "📌 TASKFLOW DASHBOARD",
          },
        },

        {
          type:
            "divider",
        },
      ];

      /*
        NO TASKS
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
              "📭 No Team Tasks Found",
          },
        });
      }

      /*
        TASKS
      */

      for (
        const task of dashboardTasks
      ) {
                /*
        SKIP OLD TASKS
        */

        if (
            !task.assignedUsers
            ) {

            continue;
            }

        /*
          COMPLETED USERS
        */

        const completedUsers =

          task.assignedUsers
            .filter(

              (u: any) =>
                u.completed
            )

            .map(
              (u: any) =>
                `• ${u.userName}`
            )

            .join("\n");

        /*
          PENDING USERS
        */

        const pendingUsers =

          task.assignedUsers
            .filter(

              (u: any) =>
                !u.completed
            )

            .map(
              (u: any) =>
                `• ${u.userName}`
            )

            .join("\n");

        /*
          PROGRESS
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
          TASK CARD
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

                `📈 Progress: ${completedCount}/${totalUsers}\n` +

                `📅 Deadline: ${task.deadline}`,
            },
          },

          {
            type:
              "section",

            fields: [

              {
                type:
                  "mrkdwn",

                text:

                  `✅ *Completed*\n` +

                  `${completedUsers || "None"}`,
              },

              {
                type:
                  "mrkdwn",

                text:

                  `⏳ *Pending*\n` +

                  `${pendingUsers || "None"}`,
              },
            ],
          },

          {
            type:
              "divider",
          }
        );
      }

      /*
        PUBLISH HOME TAB
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