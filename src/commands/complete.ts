// import { App } from "@slack/bolt";

// import {
//   getTaskById,
//   updateTask,
// } from "../services/taskService";

// export const registerCompleteCommand = (
//   app: App
// ) => {

//   app.command(

//     "/complete",

//     async ({
//       command,
//       ack,
//       respond,
//     }) => {

//       try {

//         await ack();

//         const taskId =
//           Number(
//             command.text.trim()
//           );

//         /*
//           VALIDATE
//         */

//         if (!taskId) {

//           await respond(

//             "❌ Format:\n/complete taskId"
//           );

//           return;
//         }

//         /*
//           GET TASK FROM MONGODB
//         */

//         const task =
//           await getTaskById(
//             taskId
//           );

//         /*
//           TASK NOT FOUND
//         */

//         if (!task) {

//           await respond(
//             "❌ Task not found"
//           );

//           return;
//         }

//         /*
//           ONLY ASSIGNED USER
//         */

//         if (
//           task.assignedTo !==
//           command.user_id
//         ) {

//           await respond(

//             "❌ You are not assigned to this task"
//           );

//           return;
//         }

//         /*
//           ALREADY COMPLETED
//         */

//         if (
//           task.status ===
//           "completed"
//         ) {

//           await respond(

//             "✅ Task already completed"
//           );

//           return;
//         }

//         /*
//           UPDATE TASK
//         */

//         await updateTask(

//           taskId,

//           {
//             status:
//               "completed",
//           }
//         );

//         console.log(
//           "✅ TASK COMPLETED"
//         );

//         /*
//           NOTIFY MANAGER
//         */

//         await app.client.chat.postMessage({

//           token:
//             process.env
//               .SLACK_BOT_TOKEN,

//           channel:
//             task.assignedBy,

//           text:

//             `✅ *Task Completed*\n\n` +

//             `📝 *Task:* ${task.taskName}\n` +

//             `👤 *Completed By:* <@${command.user_id}>`,
//         });

//         /*
//           SUCCESS
//         */

//         await respond(

//           "✅ Task Completed Successfully"
//         );

//       } catch (error) {

//         console.error(
//           "❌ Complete Error:",
//           error
//         );

//         await respond(

//           "❌ Failed to complete task"
//         );
//       }
//     }
//   );
// };