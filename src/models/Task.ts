import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    id: Number,
  },
  {
    strict: false,
    timestamps: true,
  }
);

export const Task = mongoose.model(
  "Task",
  TaskSchema
);