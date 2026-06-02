import { App } from "@slack/bolt";

import {
  getTasks,
  getTaskById,
  replaceTask,
} from "../services/taskService";

import {
  buildTaskCard,
} from "../services/messageService";

export const registerModifyCommand = (
  app: App
) => {

  /*
    MODIFY COMMAND
  */

  app.command(

    "/modify",

    async ({
      ack,
      command,
      client,
      respond,
    }: any) => {

      try {

        await ack();

        console.log(
          "✅ MODIFY COMMAND HIT"
        );

        /*
          READ TASKS
        */

        const tasks: any =
          await getTasks();
        /*
          FILTER PENDING TASKS
        */

        const pendingTasks =
          tasks.filter(
            (task: any) =>

              task.assignedBy ===
                command.user_id &&

              String(
                task.status || ""
              )
                .trim()
                .toLowerCase() ===
                "pending"
          );

        /*
          NO TASKS
        */

        if (
          pendingTasks.length === 0
        ) {

          await respond(
            "📭 No pending tasks found."
          );

          return;
        }

        /*
          OPEN MODAL
        */

        await client.views.open({

          trigger_id:
            command.trigger_id,

          view: {

            type:
              "modal",

            callback_id:
              "modify_task_submit",

            title: {

              type:
                "plain_text",

              text:
                "Modify Task",
            },

            submit: {

              type:
                "plain_text",

              text:
                "Update",
            },

            close: {

              type:
                "plain_text",

              text:
                "Cancel",
            },

            blocks: [

              /*
                SELECT TASK
              */

              {
                type:
                  "input",

                block_id:
                  "task_block",

                label: {

                  type:
                    "plain_text",

                  text:
                    "Select Task",
                },

                element: {

                  type:
                    "static_select",

                  action_id:
                    "task_input",

                  placeholder: {

                    type:
                      "plain_text",

                    text:
                      "Choose Task",
                  },

                  options:
                    pendingTasks.map(
                      (
                        task: any
                      ) => ({

                        text: {

                          type:
                            "plain_text",

                          text:
                            String(
                              task.taskName
                            ).length > 70

                              ? String(
                                  task.taskName
                                ).slice(
                                  0,
                                  67
                                ) + "..."

                              : String(
                                  task.taskName
                                ),
                        },

                        value:
                          String(
                            task.id
                          ),
                      })
                    ),
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

                optional:
                  true,

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
                    "task_name",

                  placeholder: {

                    type:
                      "plain_text",

                    text:
                      "Leave empty to keep current",
                  },
                },
              },

              /*
                DEADLINE
              */

              {
                type:
                  "input",

                block_id:
                  "deadline_block",

                optional:
                  true,

                label: {

                  type:
                    "plain_text",

                  text:
                    "Deadline",
                },

                element: {

                  type:
                    "plain_text_input",

                  action_id:
                    "deadline",

                  placeholder: {

                    type:
                      "plain_text",

                    text:
                      "YYYY-MM-DD HH:mm",
                  },
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

                optional:
                  true,

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
          "❌ MODIFY COMMAND ERROR:"
        );

        console.error(
          error
        );
      }
    }
  );

  /*
    HANDLE MODAL SUBMIT
  */

  app.view(

  "modify_task_submit",

  async ({
    ack,
    view,
    client,
  }: any) => {

    /*
      ACK IMMEDIATELY
    */

    await ack();

    /*
      RUN HEAVY LOGIC
      IN BACKGROUND
    */

    setTimeout(

      async () => {

        try {

          console.log(
            "✅ MODIFY VIEW HIT"
          );

          /*
            TASK ID
          */

          const taskId =
            String(

              view.state.values
                ?.task_block
                ?.task_input
                ?.selected_option
                ?.value || ""
            );

          /*
            VALIDATE
          */

          if (!taskId) {

            console.log(
              "❌ INVALID TASK ID"
            );

            return;
          }

          /*
            READ TASKS
          */

          const task: any =
            await getTaskById(
              taskId
            );

          /*
            FIND TASK
          */


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
            UPDATED VALUES
          */

          const taskName =

            view.state.values
              ?.task_name_block
              ?.task_name
              ?.value
              ?.trim() ||

            task.taskName;

          const deadline =

            view.state.values
              ?.deadline_block
              ?.deadline
              ?.value
              ?.trim() ||

            task.deadline;

          const priority =

            view.state.values
              ?.priority_block
              ?.priority_input
              ?.selected_option
              ?.value ||

            task.priority;

          /*
            UPDATE TASK
          */

          task.taskName =
            taskName;

          task.deadline =
            deadline;

          task.priority =
            priority;

          /*
            SAVE DATABASE
          */

          await replaceTask(
              taskId,
              task
            );

          console.log(
            "✅ TASK UPDATED"
          );

          /*
            UPDATE RECEIVER CARDS
          */

          if (

            Array.isArray(
              task.userMessages
            )

            &&

            task.userMessages.length > 0
          ) {

            for (
              const messageData of
              task.userMessages
            ) {

              try {

                /*
                  VALIDATE
                */

                if (
                  !messageData?.channelId ||
                  !messageData?.messageTs
                ) {

                  console.log(
                    "❌ INVALID MESSAGE DATA"
                  );

                  continue;
                }

                /*
                  UPDATE CARD
                */

                await client.chat.update({

                  channel:
                    messageData.channelId,

                  ts:
                    messageData.messageTs,

                  text:
                    "📌 Task Updated",

                  blocks:
                    buildTaskCard({

                      id:
                        task.id,

                      taskName:
                        task.taskName,

                      assignedBy:
                        task.assignedBy,

                      assignedTo:
                        messageData.userId,

                      deadline:
                        task.deadline,

                      status:
                        task.status,

                      priority:
                        task.priority,
                    }),
                });

                console.log(
                  "✅ CARD UPDATED"
                );

              } catch (error) {

                console.log(
                  "❌ CARD UPDATE FAILED"
                );

                console.error(
                  error
                );
              }
            }

          } else {

            console.log(
              "⚠️ NO USER MESSAGES FOUND"
            );
          }

          /*
            MANAGER SUCCESS
          */

          try {

            const managerId =
              task.assignedBy;

            if (!managerId) {

              console.log(
                "❌ NO MANAGER ID"
              );

              return;
            }

            const managerDM =
              await client.conversations.open({

                users:
                  managerId,
              });

            const managerChannel =
              managerDM.channel?.id;

            if (!managerChannel) {

              console.log(
                "❌ MANAGER CHANNEL NOT FOUND"
              );

              return;
            }

            await client.chat.postMessage({

              channel:
                managerChannel,

              text:

                `✅ *Task Updated Successfully*\n\n` +

                `📝 *Task:* ${taskName}\n` +

                `📅 *Deadline:* ${deadline}\n` +

                `🔥 *Priority:* ${priority}`,
            });

            console.log(
              "✅ SUCCESS MESSAGE SENT"
            );

          } catch (error) {

            console.log(
              "❌ MANAGER MESSAGE ERROR"
            );

            console.error(
              error
            );
          }

        } catch (error) {

          console.log(
            "❌ UPDATE ERROR:"
          );

          console.error(
            error
          );
        }

      },

      0
    );
  }
);
};