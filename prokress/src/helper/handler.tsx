import { decodeToken, isExpired } from "react-jwt";
import type { projectType } from "./types";

//const url: string =
//  "https://project-management-app-prokress-backend.2.rahtiapp.fi";
const url: string = "http://localhost:8080";
interface Task {
  taskId: number;
  title: string;
  description: string;
  deadline: string;
}

interface TaskList {
  taskListId: number;
  projectId: string;
  title: string;
  tasks: Task[];
}

type TaskListsState = Record<string, TaskList>;
interface userPayload {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}

// Function for sending new Users registerations into backend.
export async function registerHandler(data: userPayload): Promise<string> {
  const response = await fetch(
    url + "/register",
    {
      //const response = await fetch(api_url + '/api/register', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.userName.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        passwordHash: data.passwordHash.trim(),
      }),
    },
  );
  console.log(data);
  if (!response.ok) {
    throw new Error("Error occured while creating user");
  }
  return await response.text();
}

// Funtion for getting all users.
export async function loginHandler(
  email: string,
  password: string,
): Promise<string> {
  try {
    const response = await fetch(url + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        passwordHash: password.trim(),
      }),
    });
    if (!response.ok) {
      throw new Error("Error occured while creating user");
    }
    const tokenData = await response.text();
    return tokenData;
  } catch (error) {
    console.error("Error fetching token: ", error);
    throw error;
  }
}

// Fetch all project logged in user is part of.
export async function getProjectsForUser(
  token: string | null,
): Promise<projectType[]> {
  const response = await fetch(`${url}/api/projects`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer: ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Error occured fetching projects");
  }
  const jsonData = await response.json();
  return jsonData;
}

// decoder for userWebToken
export function decodeUserWebToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      decoded: null,
      expired: true,
    };
  }
  try {
    const decoded = decodeToken(token);
    const expired = isExpired(token);
    return {
      decoded,
      expired,
    };
  } catch (error) {
    return {
      decoded: null,
      expired: true,
    };
  }
}

export function transformTaskLists(data: unknown) {
  const result: TaskListsState = {};

  if (!Array.isArray(data)) return result;

  data.forEach((list: any) => {
    result[list.title] = {
      taskListId: list.taskListId,
      projectId: list.projectId,
      title: list.title,
      tasks: list.tasks.map((task: any) => ({
        taskId: task.taskId,
        title: task.title,
        description: task.description,
      })),
    };
  });
  return result;
}

// funtion to create new tasklist
export async function createNewTasklist(
  token: string,
  projectId: string,
  taskListTitle: string,
): Promise<Response> {
  try {
    const response = await fetch(`${url}/api/projects/${projectId}/tasklists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer: ${token}`,
      },
      body: JSON.stringify({ title: taskListTitle.trim() }),
    });
    if (!response.ok) {
      throw new Error("Error occured fetching projects");
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error: unknown) {
    console.error("Error fetching token: ", error);
    throw error;
  }
}

export async function createNewProject(
  projectTitle: string,
  description: string,
  is_shared: boolean,
): Promise<Response> {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${url}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer: ${token}`,
      },
      body: JSON.stringify({
        title: projectTitle.trim(),
        description: description.trim(),
        is_shared: is_shared,
      }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Error occured creating project: ${response.status} ${response.statusText} ${body}`,
      );
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error: unknown) {
    console.error("Error fetching project: ", error);
    throw error;
  }
}
export async function deleteProject(
  token: string,
  projectId: string,
): Promise<Response> {
  try {
    const response = await fetch(`${url}/api/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer: ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    console.error("Failed to delete project", error);
    throw new Error(`Error while deleting`);
  }
}

// function to delete tasklist
export async function deleteTasklist(
  token: string,
  projectId: string,
  taskListId: number,
): Promise<Response> {
  try {
    const response = await fetch(
      `${url}/api/projects/${projectId}/tasklists/${taskListId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer: ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    console.error("Failed to delete tasklist");
    throw new Error(`Error something whent wrong while deleting: ${error}`);
  }
}

// funtion to create new Task
export async function createNewTask(
  projectId: string,
  taskListId: number,
  taskTitle: string,
  description: string,
  deadline: string,
): Promise<Response> {
  try {
    const token = localStorage.getItem("token");
    console.log(projectId, taskListId, taskTitle, description, deadline);
    const response = await fetch(
      `${url}/api/projects/${projectId}/tasklists/${taskListId}/tasks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer: ${token}`,
        },
        body: JSON.stringify({
          title: taskTitle.trim() ?? "",
          description: description.trim() ?? "",
          deadline: `${deadline}T00:00`,
          createdBy: { appUserId: 1 },
          assignedUser: null,
        }),
      },
    );
    if (!response.ok) {
      throw new Error("Error occured creating new Task");
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error: unknown) {
    console.error("Error fetching token: ", error);
    throw error;
  }
}
export async function deleteTask(
  token: string,
  projectId: string,
  taskListId: number,
  taskId: number,
): Promise<Response> {
  try {
    const response = await fetch(
      `${url}/api/projects/${projectId}/tasklists/${taskListId}/tasks/${taskId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer: ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    console.error("Failed to delete tasklist");
    throw new Error(`Error something went wrong while deleting: ${error}`);
  }
}

// GET TASK DATA

export async function getTaskData(
  token: string | null,
  projectId: string | undefined,
  taskListId: number,
  taskId: number,
): Promise<Task> {
  try {
    // get task
    const response = await fetch(
      `${url}/api/projects/${projectId}/tasklists/${taskListId}/tasks/${taskId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer: ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch task");
    }
    return await response.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

//  EDIT TASK helper
export async function editTask(
  projectId: string | undefined,
  taskListId: number,
  task: Task,
): Promise<Response> {
  try {
    const token = localStorage.getItem("token");
    const taskId = task.taskId;

    const response = await fetch(
      `${url}/api/projects/${projectId}/tasklists/${taskListId}/tasks/${taskId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer: ${token}`,
        },
        body: JSON.stringify({
          taskId: taskId,
          title: task.title.trim() ?? "",
          description: task.description.trim() ?? "",
          deadline: `${task.deadline}T00:00`,
          assignedUser: null,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Error occured editing task");
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error: unknown) {
    console.error("Error editing task: ", error);
    throw error;
  }
}
