import { App } from "@slack/bolt";

import {
  readTasks,
  writeTasks,
} from "../utils/fileHelper";

import {
  buildTaskCard,
} from "../services/messageService";

export const registerAssignCommand = (
  app: App
) => {

  /*
    OPEN ASSIGN MODAL
  */

  app.command(

    "/assign",

    async ({
      ack,
      body,
      client,
    }) => {

      try {

        await ack();

        /*
          OPEN MODAL
        */

        await client.views.open({

          trigger_id:
            (body as any)
              .trigger_id,

          view: {

            type: "modal",

            callback_id:
              "create_task_modal",

            title: {

              type:
                "plain_text",

              text:
                "Create Task",
            },

            submit: {

              type:
                "plain_text",

              text:
                "Create",
            },

            close: {

              type:
                "plain_text",

              text:
                "Cancel",
            },

            blocks: [

              /*
                USER SELECT
              */

              {
                type:
                  "input",

                block_id:
                  "assign_user_block",

                label: {

                  type:
                    "plain_text",

                  text:
                    "Assign To",
                },

                element: {

                  type:
                    "users_select",

                  action_id:
                    "assign_user_input",

                  placeholder: {

                    type:
                      "plain_text",

                    text:
                      "Select User",
                  },
                },
              },

              /*
                TASK NAME
              */

              {
                type:
                  "input",

                block_id:
                  "task_name_block",

                label: {

                  type:
                    "plain_text",

                  text:
                    "Task Name",
                },

                element: {

                  type:
                    "plain_text_input",

                  action_id:
                    "task_name_input",

                  placeholder: {

                    type:
                      "plain_text",

                    text:
                      "Enter task name",
                  },
                },
              },

              /*
                DATE PICKER
              */

              {
                type:
                  "input",

                block_id:
                  "deadline_block",

                label: {

                  type:
                    "plain_text",

                  text:
                    "Deadline Date",
                },

                element: {

                  type:
                    "datepicker",

                  action_id:
                    "deadline_input",
                },
              },

              /*
                TIME SELECTOR
              */

              {
                type:
                  "input",

                block_id:
                  "time_block",

                label: {

                  type:
                    "plain_text",

                  text:
                    "Deadline Time",
                },

                element: {

                  type:
                    "static_select",

                  action_id:
                    "time_input",

                  placeholder: {

                    type:
                      "plain_text",

                    text:
                      "Select Time",
                  },

                  options: [

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "09:00 AM",
                      },

                      value:
                        "09:00",
                    },

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "10:00 AM",
                      },

                      value:
                        "10:00",
                    },

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "11:00 AM",
                      },

                      value:
                        "11:00",
                    },

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "12:00 PM",
                      },

                      value:
                        "12:00",
                    },

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "01:00 PM",
                      },

                      value:
                        "13:00",
                    },

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "02:00 PM",
                      },

                      value:
                        "14:00",
                    },

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "03:00 PM",
                      },

                      value:
                        "15:00",
                    },

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "04:00 PM",
                      },

                      value:
                        "16:00",
                    },

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "05:00 PM",
                      },

                      value:
                        "17:00",
                    },

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "06:00 PM",
                      },

                      value:
                        "18:00",
                    },
                  ],
                },
              },

              /*
                PRIORITY
              */

              {
                type:
                  "input",

                block_id:
                  "priority_block",

                label: {

                  type:
                    "plain_text",

                  text:
                    "Priority",
                },

                element: {

                  type:
                    "static_select",

                  action_id:
                    "priority_input",

                  placeholder: {

                    type:
                      "plain_text",

                    text:
                      "Select Priority",
                  },

                  options: [

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "High",
                      },

                      value:
                        "high",
                    },

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "Medium",
                      },

                      value:
                        "medium",
                    },

                    {
                      text: {
                        type:
                          "plain_text",

                        text:
                          "Low",
                      },

                      value:
                        "low",
                    },
                  ],
                },
              },
            ],
          },
        });

      } catch (error) {

        console.log(
          "❌ MODAL ERROR:",
          error
        );
      }
    }
  );

  /*
    HANDLE MODAL SUBMIT
  */

  app.view(

    "create_task_modal",

    async ({
      ack,
      body,
      view,
      client,
    }) => {

      try {

        await ack();

        /*
          GET USER
        */

        const assignedTo =

          view.state.values
            .assign_user_block
            .assign_user_input
            .selected_user;

        /*
          GET TASK NAME
        */

        const taskName =

          view.state.values
            .task_name_block
            .task_name_input
            .value;

        /*
          GET DATE
        */

        const selectedDate =

          view.state.values
            .deadline_block
            .deadline_input
            .selected_date;

        /*
          GET TIME
        */

        const selectedTime =

          view.state.values
            .time_block
            .time_input
            .selected_option?.value ||

          "10:00";

        /*
          FINAL DEADLINE
        */

        const deadline =
          `${selectedDate} ${selectedTime}`;

        /*
          GET PRIORITY
        */

        const priority =

          view.state.values
            .priority_block
            .priority_input
            .selected_option?.value ||

          "medium";

        /*
          VALIDATE
        */

        if (
          !assignedTo ||
          !taskName ||
          !deadline
        ) {

          console.log(
            "❌ INVALID DATA"
          );

          return;
        }

        /*
          READ TASKS
        */

        const tasks =
          readTasks();

        /*
          CREATE TASK
        */

        /*
  GET ASSIGNED USER INFO
*/
const userInfo =
  await client.users.info({
    user: assignedTo,
  });

const assignedToName =
  userInfo.user?.name ||
  "unknown";

/*
  CREATE TASK
*/
const newTask = {

  id: Date.now(),

  taskName,

  assignedBy:
    body.user.id,

  assignedByName:
    body.user.name,

  assignedTo,

  // IMPORTANT FIX
  assignedToName,

  deadline,

  priority,

  status:
    "pending",

  reminderSent:
    false,

  overdueSent:
    false,
};

        /*
          SAVE TASK
        */

        tasks.push(newTask);

        writeTasks(tasks);

        console.log(
          "✅ TASK CREATED"
        );

        /*
          OPEN USER DM
        */

        const dm =
          await client
            .conversations
            .open({

              users:
                assignedTo,
            });

        const channelId =
          dm.channel?.id;

        /*
          VALIDATE
        */

        if (!channelId) {

          console.log(
            "❌ DM FAILED"
          );

          return;
        }

        /*
          SEND TASK CARD
        */

        await client.chat.postMessage({

          channel:
            channelId,

          text:
            "📌 New Task Assigned",

          blocks:
            buildTaskCard({

              id:
                newTask.id,

              taskName,

              assignedBy:
                newTask.assignedBy,

              assignedTo,

              deadline,

              status:
                "pending",

              priority:
                newTask.priority,
            }),
        });

        console.log(
          "✅ TASK SENT"
        );

      } catch (error) {

        console.log(
          "❌ VIEW ERROR:",
          error
        );
      }
    }
  );
};