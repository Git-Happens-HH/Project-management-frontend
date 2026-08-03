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
   taskId: string;
   title: string;
   description: string;
   deadline: string;
}

export interface TaskList {
   taskListId: string;
   projectId: string;
   title: string;
   tasks: TaskData[];
}

export type PendingMove = {
   sourceListId: string;
   targetListId: string;
   taskId: string;
   targetIndex?: number;
};

export type TaskListsState = Record<string, TaskList>;

export interface userPayload {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}

