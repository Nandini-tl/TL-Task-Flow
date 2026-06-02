import { Task } from "../models/Task";

export const getTasks = async () => {
  return await Task.find();
};

export const createTask = async (
  task: any
) => {

  return await Task.create(task);
};

export const getTaskById = async (
  taskId: any
) => {

  return await Task.findOne({
    id: Number(taskId),
  });
};

export const updateTask = async (
  taskId: number,
  updates: any
) => {

  return await Task.updateOne(
    { id: Number(taskId) },
    {
      $set: updates,
    }
  );
};

// export const replaceTask = async (
//   taskId: any,
//   task: any
// ) => {

//   return await Task.replaceOne(
//     { id: Number(taskId) },
//     task
//   );
// };
export const replaceTask = async (
  taskId: any,
  task: any
) => {

  const result =
    await Task.findOneAndUpdate(

      {
        id: Number(taskId),
      },

      {
        $set: {

          taskName:
            task.taskName,

          deadline:
            task.deadline,

          priority:
            task.priority,

          status:
            task.status,

          assignedUsers:
            task.assignedUsers,

          progress:
            task.progress,

          reminderSent:
            task.reminderSent,

          overdueSent:
            task.overdueSent,

          userMessages:
            task.userMessages,
        },
      },

      {
        new: true,
      }
    );

  console.log(
    "UPDATED TASK:"
  );

  return result;
};

export const deleteTask = async (
  taskId: number
) => {

  return await Task.deleteOne({
    id: Number(taskId),
  });
};