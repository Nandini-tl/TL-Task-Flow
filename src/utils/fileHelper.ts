import fs from "fs";
import path from "path";

const FILE_PATH = path.join(__dirname, "../data/tasks.json");

export const readTasks = () => {
  const data = fs.readFileSync(FILE_PATH, "utf-8");
  return JSON.parse(data);
};

export const writeTasks = (tasks: any) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2));
};