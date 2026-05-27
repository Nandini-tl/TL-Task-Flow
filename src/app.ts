import dotenv from "dotenv";

import { App } from "@slack/bolt";
import { registerModifyCommand } from "./commands/modify";
import {
  registerViewAssignCommand,
} from "./commands/viewassign";

import {
  registerAssignCommand,
} from "./commands/assign";

import {
  registerMyTasksCommand,
} from "./commands/mytasks";

import {
  registerCompleteCommand,
} from "./commands/complete";

import {
  startReminderService,
} from "./services/remainderService";

import {
  buildTaskCard,
} from "./services/messageService";

import {
  readTasks,
  writeTasks,
} from "./utils/fileHelper";

import {
  publishDashboard,
} from "./services/dashboardService";

dotenv.config();

/*
  SLACK APP
*/

const app = new App({

  token:
    process.env.SLACK_BOT_TOKEN!,

  signingSecret:
    process.env
      .SLACK_SIGNING_SECRET!,

  port: 3000,

  /*
    IMPORTANT
    FIXES ACK TIMEOUTS
  */

  processBeforeResponse:
    true,
});

/*
  REGISTER COMMANDS
*/

registerAssignCommand(app);

registerMyTasksCommand(app);

registerCompleteCommand(app);

registerViewAssignCommand(app);

registerModifyCommand(app);

/*
  START REMINDER SERVICE
*/

startReminderService(app);

/*
  APP HOME EVENT
*/

app.event(

  "app_home_opened",

  async ({
    event,
  }) => {

    try {

      /*
        ASYNC DASHBOARD
      */

      setTimeout(

        async () => {

          try {

            await publishDashboard(

              app,

              event.user
            );

          } catch (error) {

            console.log(

              "❌ DASHBOARD ERROR:",

              error
            );
          }

        },

        0
      );

    } catch (error) {

      console.log(

        "❌ HOME ERROR:",

        error
      );
    }
  }
);

/*
  COMPLETE BUTTON
*/

app.action(

  "complete_task",

  async ({
    ack,
    body,
    client,
  }) => {

    /*
      ACK FIRST
    */

    await ack();

    console.log(
      "✅ BUTTON CLICKED"
    );

    try {

      /*
        TASK ID
      */

      const taskId =

        (body as any)
          .actions[0]
          .value;

      /*
        CLICKED USER
      */

      const clickedUserId =

        (body as any)
          .user.id;

      console.log(
        "TASK ID:",
        taskId
      );

      console.log(
        "CLICKED USER:",
        clickedUserId
      );

      /*
        READ TASKS
      */

      const tasks =
        readTasks();

      /*
        FIND TASK
      */

      const task =
        tasks.find(

          (t: any) =>

            String(t.id) ===
            String(taskId)
        );

      /*
        TASK NOT FOUND
      */

      if (!task) {

        console.log(
          "❌ TASK NOT FOUND"
        );

        return;
      }

      /*
        VALIDATE USERS
      */

      if (
        !task.assignedUsers
      ) {

        console.log(
          "❌ NO ASSIGNED USERS"
        );

        return;
      }

      /*
        FIND USER
      */

      const assignedUser =

        task.assignedUsers.find(

          (u: any) =>

            u.userId ===
            clickedUserId
        );

      /*
        USER NOT FOUND
      */

      if (!assignedUser) {

        console.log(
          "❌ USER NOT FOUND"
        );

        return;
      }

      /*
        ALREADY COMPLETED
      */

      if (
        assignedUser.completed
      ) {

        console.log(
          "⚠️ ALREADY COMPLETED"
        );

        return;
      }

      /*
        MARK COMPLETE
      */

      assignedUser.completed =
        true;

      assignedUser.completedAt =
        new Date()
          .toISOString();

      console.log(
        "✅ USER COMPLETED TASK"
      );

      /*
        PROGRESS
      */

      const completedCount =

        task.assignedUsers.filter(

          (u: any) =>
            u.completed
        ).length;

      const totalUsers =

        task.assignedUsers
          .length;

      /*
        UPDATE PROGRESS
      */

      task.progress = {

        completed:
          completedCount,

        total:
          totalUsers,
      };

      console.log(

        `📈 ${completedCount}/${totalUsers}`
      );

      /*
        SINGLE USER
      */

      if (
        task.assignmentType ===
        "single"
      ) {

        task.status =
          "completed";

        /*
          MANAGER NOTIFY
        */

        try {

          const managerDM =

            await client
              .conversations
              .open({

                users:
                  task.assignedBy,
              });

          const managerChannel =

            managerDM.channel?.id;

          if (
            managerChannel
          ) {

            await client
              .chat
              .postMessage({

                channel:
                  managerChannel,

                text:

                  `✅ TASK COMPLETED\n\n` +

                  `📝 ${task.taskName}\n` +

                  `👤 Completed By: ${assignedUser.userName}`,
              });

            console.log(
              "✅ MANAGER NOTIFIED"
            );
          }

        } catch (error) {

          console.log(

            "❌ MANAGER ERROR:",

            error
          );
        }
      }

      /*
        TEAM TASK COMPLETE
      */

      if (

        task.assignmentType !==
        "single"

        &&

        completedCount ===
        totalUsers
      ) {

        task.status =
          "completed";

        console.log(
          "✅ TEAM TASK COMPLETED"
        );

        /*
          COMPLETED USERS
        */

        const completedNames =

          task.assignedUsers

            .map(
              (u: any) =>
                `• ${u.userName}`
            )

            .join("\n");

        /*
          NOTIFY MANAGER
        */

        try {

          const managerDM =

            await client
              .conversations
              .open({

                users:
                  task.assignedBy,
              });

          const managerChannel =

            managerDM.channel?.id;

          if (
            managerChannel
          ) {

            await client
              .chat
              .postMessage({

                channel:
                  managerChannel,

                text:

                  `━━━━━━━━━━━━━━\n` +

                  `✅ TEAM TASK COMPLETED\n\n` +

                  `📝 ${task.taskName}\n\n` +

                  `👥 Completed By:\n` +

                  `${completedNames}\n\n` +

                  `📈 ${completedCount}/${totalUsers}\n` +

                  `━━━━━━━━━━━━━━`,
              });

            console.log(
              "✅ MANAGER NOTIFIED"
            );
          }

        } catch (error) {

          console.log(

            "❌ MANAGER ERROR:",

            error
          );
        }
      }

      /*
        SAVE
      */

      writeTasks(tasks);

      /*
        DASHBOARD UPDATE
      */

      setTimeout(

        async () => {

          try {

            await publishDashboard(
              app,
              clickedUserId
            );

            await publishDashboard(
              app,
              task.assignedBy
            );

            console.log(
              "✅ DASHBOARD UPDATED"
            );

          } catch (error) {

            console.log(

              "❌ DASHBOARD ERROR:",

              error
            );
          }

        },

        0
      );

      /*
        UPDATE CARD
      */

      try {

        await client.chat.update({

          channel:
            (body as any)
              .container
              .channel_id,

          ts:
            (body as any)
              .container
              .message_ts,

          text:
            "Task Updated",

          blocks:
            buildTaskCard({

              id:
                task.id,

              taskName:
                task.taskName,

              assignedBy:
                task.assignedBy,

              assignedTo:
                clickedUserId,

              deadline:
                task.deadline,

              status:

                assignedUser.completed
                  ? "completed"
                  : "pending",

              priority:
                task.priority,
            }),
        });

        console.log(
          "✅ CARD UPDATED"
        );

      } catch (error) {

        console.log(

          "❌ CARD UPDATE ERROR:",

          error
        );
      }

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