import { App } from "@slack/bolt";

import {
  createTask,
  updateTask,
} from "../services/taskService";

import {
  buildTaskCard,
} from "../services/messageService";

import {
  publishDashboard,
} from "../services/dashboardService";

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
                USERS
              */

              {
                type:
                  "input",

                optional:
                  true,

                block_id:
                  "assign_users_block",

                label: {

                  type:
                    "plain_text",

                  text:
                    "Assign Users",
                },

                element: {

                  type:
                    "multi_users_select",

                  action_id:
                    "assign_users_input",

                  placeholder: {

                    type:
                      "plain_text",

                    text:
                      "Select Team Members",
                  },
                },
              },

              /*
                CHANNEL
              */

              {
                type:
                  "input",

                optional:
                  true,

                block_id:
                  "channel_block",

                label: {

                  type:
                    "plain_text",

                  text:
                    "Assign Channel",
                },

                element: {

                  type:
                    "conversations_select",

                  action_id:
                    "channel_input",

                  default_to_current_conversation:
                    false,

                  filter: {

                    include: [
                      "public",
                      "private",
                    ],
                  },

                  placeholder: {

                    type:
                      "plain_text",

                    text:
                      "Select Channel",
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
                },
              },

              /*
                DATE
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
                TIME
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

        /*
          USERS
        */

        const selectedUsers =

          view.state.values
            .assign_users_block
            .assign_users_input
            .selected_users;

        /*
          CHANNEL
        */

        const selectedChannel =

          view.state.values
            .channel_block
            .channel_input
            .selected_conversation;

        /*
          TASK NAME
        */

        const taskName =

          view.state.values
            .task_name_block
            .task_name_input
            .value;

        /*
          DATE
        */

        const selectedDate =

          view.state.values
            .deadline_block
            .deadline_input
            .selected_date;

        /*
          TIME
        */

        const selectedTime =

          view.state.values
            .time_block
            .time_input
            .selected_option?.value ||

          "10:00";

        /*
          PRIORITY
        */

        const priority =

          view.state.values
            .priority_block
            .priority_input
            .selected_option?.value ||

          "medium";

        /*
          FUTURE DATE VALIDATION
        */

        const now =
          new Date();

        const selectedDeadline =
          new Date(
            `${selectedDate}T${selectedTime}:00`
          );

        if (
          selectedDeadline <= now
        ) {

          await ack({

            response_action:
              "errors",

            errors: {

              deadline_block:

                "Deadline must be future date/time",
            },
          });

          return;
        }

        /*
          VALIDATE USERS / CHANNEL
        */

        if (

          (!selectedUsers ||
            selectedUsers.length === 0)

          &&

          !selectedChannel
        ) {

          await ack({

            response_action:
              "errors",

            errors: {

              assign_users_block:

                "Select users OR a channel",
            },
          });

          return;
        }

        /*
          VALIDATE BOTH
        */

        if (

          selectedUsers &&
          selectedUsers.length > 0

          &&

          selectedChannel
        ) {

          await ack({

            response_action:
              "errors",

            errors: {

              channel_block:

                "Choose either users OR a channel",
            },
          });

          return;
        }

        /*
          TASK NAME VALIDATION
        */

        if (!taskName) {

          await ack({

            response_action:
              "errors",

            errors: {

              task_name_block:

                "Task name is required",
            },
          });

          return;
        }

        /*
          SUCCESS ACK
        */

        await ack();

        /*
          HEAVY WORK
        */

        setTimeout(

          async () => {

            try {

              const deadline =
                `${selectedDate} ${selectedTime}`;

              /*
                ASSIGNMENT TYPE
              */

              let assignmentType =
                "multiple";

              /*
                FINAL USERS
              */

              let finalUsers =
                selectedUsers || [];

              /*
                CHANNEL MEMBERS
              */

              if (
                selectedChannel
              ) {

                assignmentType =
                  "channel";

                const membersResponse =

                  await client.conversations.members({

                    channel:
                      selectedChannel,
                  });

                finalUsers =

                  membersResponse.members
                    ?.filter(

                      (id: string) =>
                        id.startsWith("U")
                    ) || [];
              }

              /*
                REMOVE DUPLICATES
              */

              finalUsers = [
                ...new Set(finalUsers)
              ];

              /*
                SINGLE USER
              */

              if (
                finalUsers.length === 1
              ) {

                assignmentType =
                  "single";
              }

              /*
                ASSIGNED USERS
              */

              const assignedUsers =
                await Promise.all(

                  finalUsers.map(
                    async (
                      userId: string
                    ) => {

                      const userInfo =
                        await client.users.info({

                          user:
                            userId,
                        });

                      return {

                        userId,

                        userName:

                          userInfo.user?.name ||

                          "unknown",

                        completed:
                          false,

                        completedAt:
                          null,
                      };
                    }
                  )
                );

              /*
                TASKS
              */

              

              /*
                NEW TASK
              */

              const newTask: any = {

                id:
                  Date.now(),

                assignmentType,

                assignedChannelId:
                  selectedChannel || null,

                taskName,

                assignedBy:
                  body.user.id,

                assignedByName:
                  body.user.name,

                assignedUsers,

                deadline,

                priority,

                status:
                  "pending",

                progress: {

                  completed: 0,

                  total:
                    assignedUsers.length,
                },

                reminderSent:
                  false,

                overdueSent:
                  false,

                /*
                  MESSAGE STORAGE
                */

                userMessages: [],
              };

              /*

                SAVE
              */
             

              await createTask(
                newTask
              );

              /*
  SEND TO USERS
*/

await Promise.all(

  assignedUsers.map(

    async (user: any) => {

      try {

        /*
          OPEN DM
        */

        const dmResponse =

          await client.conversations.open({

            users:
              user.userId,
          });

        const channelId =
          dmResponse.channel?.id;

        /*
          VALIDATE
        */

        if (!channelId) {

          console.log(
            "❌ CHANNEL NOT FOUND"
          );

          return;
        }

        /*
          SEND CARD
        */

        const sentMessage =

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

                assignedTo:
                  user.userId,

                deadline,

                status:
                  "pending",

                priority,
              }),
          });

        /*
          STORE MESSAGE DATA
        */

        newTask.userMessages.push({

          userId:
            user.userId,

          channelId:
            channelId,

          messageTs:
            sentMessage.ts,
        });

        console.log(
          "✅ MESSAGE STORED"
        );

        console.log(
          newTask.userMessages
        );

      } catch (error) {

        console.log(
          "❌ SEND FAILED:",
          error
        );
      }
    }
  )
);

/*
  SAVE AGAIN
*/

await updateTask(
    newTask.id,
    {
      userMessages:
        newTask.userMessages,
    }
  );

  console.log(
    "✅ TASK SAVED WITH MESSAGE DATA"
  );

  await publishDashboard(
  app,
  body.user.id
);

console.log(
  "✅ DASHBOARD REFRESHED AFTER TASK CREATION"
);

              /*
                SAVE UPDATED TASK
              */

              // await updateTask(
              //   newTask.id,
              //   {
              //     userMessages:
              //       newTask.userMessages,
              //   }
              // );

              console.log(
                "✅ TASK DISTRIBUTED"
              );

            } catch (error) {

              console.log(
                "❌ ASYNC ERROR:",
                error
              );
            }

          },

          0
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