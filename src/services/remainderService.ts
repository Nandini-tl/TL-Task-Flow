import { App } from "@slack/bolt";

import cron from "node-cron";

import dayjs from "dayjs";

import customParseFormat from "dayjs/plugin/customParseFormat";

import {
  getTasks,
  updateTask,
} from "./taskService";

/*
  ENABLE DATE FORMAT
*/

dayjs.extend(
  customParseFormat
);

export const startReminderService = (
  app: App
) => {

  console.log(
    "✅ Reminder Service Started"
  );

  /*
    RUN EVERY MINUTE

  */
 
  cron.schedule(

    "* * * * *",

    async () => {
      console.log(
      "🔄 CRON RUNNING:",
      new Date()
    );

      const tasks: any =
          await getTasks();

      let updated =
        false;

      /*
        LOOP TASKS
      */

      for (
        const task of tasks
      ) {

        try {

          /*
            SKIP COMPLETED
          */

          if (
            task.status ===
            "completed"
          ) {

            continue;
          }

          /*
            VALIDATE USERS
          */

          if (
            !task.assignedUsers
          ) {

            continue;
          }

          /*
            CURRENT TIME
          */

          const now =
            dayjs();

          /*
            DEADLINE
          */

          const deadline =
            dayjs(

              task.deadline,

              "YYYY-MM-DD HH:mm"
            );

          /*
            DIFFERENCE
          */

          const diff =
            deadline.diff(
              now,
              "minute"
            );

          /*
            REMINDER
          */

          if (

            diff <= 60 &&

            diff >= 0 &&

            !task.reminderSent
          ) {

            console.log(
              "⏰ Sending reminders..."
            );

            /*
              SEND TO ALL
              PENDING USERS
            */

            for (
              const user of
              task.assignedUsers
            ) {

              try {

                /*
                  SKIP COMPLETED USERS
                */

                if (
                  user.completed
                ) {

                  continue;
                }

                /*
                  OPEN DM
                */

                const dm =
                  await app.client
                    .conversations
                    .open({

                      users:
                        user.userId,
                    });

                const channelId =
                  dm.channel?.id;

                /*
                  VALIDATE
                */

                if (
                  !channelId
                ) {

                  continue;
                }

                /*
                  SEND REMINDER
                */
               

                await app.client
                  .chat
                  .postMessage({

                    channel:
                      channelId,

                    text:

                      `⏰ *Task Reminder*\n\n` +

                      `📝 Task: ${task.taskName}\n` +

                      `📅 Deadline: ${task.deadline}\n` +

                      `🔥 Priority: ${task.priority}`,
                  });

                console.log(

                  "✅ Reminder Sent:",

                  user.userName
                );

              } catch (error) {

                console.log(

                  "❌ Reminder Failed:",

                  user.userName,

                  error
                );
              }
            }

            /*
              UPDATE FLAG
            */

            task.reminderSent =
              true;

            updated =
              true;
          }

          /*
            OVERDUE
          */

          if (

            now.isAfter(
              deadline
            ) &&

            !task.overdueSent
          ) {

            console.log(
              "⚠️ Sending overdue alerts..."
            );

            /*
              SEND TO ALL
              PENDING USERS
            */

            for (
              const user of
              task.assignedUsers
            ) {

              try {

                /*
                  SKIP COMPLETED USERS
                */

                if (
                  user.completed
                ) {

                  continue;
                }

                /*
                  OPEN DM
                */

                const dm =
                  await app.client
                    .conversations
                    .open({

                      users:
                        user.userId,
                    });

                const channelId =
                  dm.channel?.id;

                /*
                  VALIDATE
                */

                if (
                  !channelId
                ) {

                  continue;
                }

                /*
                  SEND ALERT
                */

                await app.client
                  .chat
                  .postMessage({

                    channel:
                      channelId,

                    text:

                      `❌ *Task Overdue*\n\n` +

                      `📝 ${task.taskName}\n` +

                      `📅 Deadline Passed`,
                  });

                console.log(

                  "⚠️ Overdue Alert:",

                  user.userName
                );

              } catch (error) {

                console.log(

                  "❌ Overdue Failed:",

                  user.userName,

                  error
                );
              }
            }

            /*
              MANAGER ALERT
            */

            try {

              /*
                OPEN MANAGER DM
              */

              const managerDM =
                await app.client
                  .conversations
                  .open({

                    users:
                      task.assignedBy,
                  });

              const managerChannel =
                managerDM.channel?.id;

              /*
                VALIDATE
              */

              if (
                managerChannel
              ) {

                await app.client
                  .chat
                  .postMessage({

                    channel:
                      managerChannel,

                    text:

                      `⚠️ *Task Overdue*\n\n` +

                      `📝 ${task.taskName}\n` +

                      `👥 Team task deadline exceeded`,
                  });

                console.log(
                  "✅ Manager Notified"
                );
              }

            } catch (error) {

              console.log(

                "❌ Manager Alert Failed:",

                error
              );
            }

            /*
              UPDATE FLAG
            */

            task.overdueSent =
              true;

            updated =
              true;
          }

        } catch (error) {

          console.log(
            "❌ Reminder Error:",
            error
          );
        }
      }

      /*
        SAVE
      */

      if (
  updated
) {

  for (
    const task of tasks
  ) {

    await updateTask(

      task.id,

      {
        reminderSent:
          task.reminderSent,

        overdueSent:
          task.overdueSent,
      }
    );
  }
}
    }
  );
};