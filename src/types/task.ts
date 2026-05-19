export interface Task {
  id: number;
  taskName: string;
  assignedBy: string;
  assignedTo: string;
  deadline: string;
  status: "pending" | "completed";
  reminderSent: boolean;
}