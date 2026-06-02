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

export const replaceTask = async (
  taskId: any,
  task: any
) => {

  return await Task.replaceOne(
    { id: Number(taskId) },
    task
  );
};

export const deleteTask = async (
  taskId: number
) => {

  return await Task.deleteOne({
    id: Number(taskId),
  });
};