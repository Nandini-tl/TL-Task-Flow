// export interface Task {
//   id: number;
//   taskName: string;
//   assignedBy: string;
//   assignedTo: string;
//   deadline: string;
//   status: "pending" | "completed";

//   reminderSent: boolean;
//   overdueSent: boolean;
// }
export interface AssignedUser {

  userId: string;

  userName: string;

  completed: boolean;

  completedAt: string | null;
}

export interface Task {

  id: number;

  taskName: string;

  assignedBy: string;

  assignedByName: string;

  assignedUsers: AssignedUser[];

  deadline: string;

  priority: string;

  status:
    | "pending"
    | "completed"
    | "overdue";

  reminderSent: boolean;

  overdueSent: boolean;
}
