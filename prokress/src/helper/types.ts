export type projectType = {
   projectId: string,
   title: string,
   description: string,
   createdAt: string,
   isShared: boolean,
}

export type appUser = {
    appUserId: string,
    userName: string,
    firstName: string,
    lastName: string,
    email: string,
    passwordHash: string,
    registeredAt: Date
}

export interface TaskData {
   taskId: number;
   title: string;
   description: string;
   deadline: string;
}

export interface TaskList {
   taskListId: number;
   projectId: string;
   title: string;
   tasks: TaskData[];
}

export type PendingMove = {
   sourceListId: number;
   targetListId: number;
   taskId: number;
   targetIndex?: number;
};

export type TaskListsState = Record<number, TaskList>;

export interface userPayload {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}

