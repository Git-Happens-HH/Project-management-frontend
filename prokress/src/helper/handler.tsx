import { decodeToken, isExpired } from "react-jwt";
import type { AppUserSummary, ProjectMember, projectType, TaskData, TaskListsState, userPayload } from "./types";
import { API_URL } from "../config";
const url: string = API_URL;

// Function for sending new Users registerations into backend.
export async function registerHandler(
   data: userPayload
): Promise<string> {
   try {
      const response = await fetch(`${url}/register`, {
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
      if (!response.ok) {
         throw new Error("Error occured while creating user");
      }
      return response.text();

   } catch (error) {
      console.error("Error fetching token: ", error);
      throw error;
   }
}

// Funtion for getting all users.
export async function loginHandler(
   email: string,
   password: string,
): Promise<string> {
   try {
      const response = await fetch(`${url}/login`, {
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
         throw new Error("Error occured while login-in");
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
      const taskListId = list.taskListId;
      if (!result[taskListId]) {
         result[taskListId] = {
            taskListId,
            projectId: list.projectId,
            title: list.title,
            tasks: [],
         };
      }

      for (const task of list.tasks ?? []) {
         const resolvedTaskListId = task.taskList?.taskListId ?? taskListId;
         if (!result[resolvedTaskListId]) {
            result[resolvedTaskListId] = {
               taskListId: resolvedTaskListId,
               projectId: list.projectId,
               title: task.taskList?.title ?? list.title,
               tasks: [],
            };
         }

         const taskAlreadyRendered = Object.values(result).some((taskList) =>
            taskList.tasks.some((existingTask) => existingTask.taskId === task.taskId),
         );

         if (!taskAlreadyRendered) {
            result[resolvedTaskListId].tasks.push({
               taskId: task.taskId,
               title: task.title,
               description: task.description,
               deadline: task.deadline ?? "",
            });
         }
      }
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

// CREATE NEW PROJECT
export async function createNewProject(
   projectTitle: string,
   description: string,
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


// function to delete tasklist
export async function deleteTasklist(
   token: string,
   projectId: string,
   taskListId: number,
): Promise<Response> {
   try {
      const response = await fetch(`${url}/api/projects/${projectId}/tasklists/${taskListId}`, {
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
      const response = await fetch(`${url}/api/projects/${projectId}/tasklists/${taskListId}/tasks`, {
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

// DELETE TASK

export async function deleteTask(
   token: string,
   projectId: string,
   taskListId: number,
   taskId: number,
): Promise<Response> {
   try {
      const response = await fetch(`${url}/api/projects/${projectId}/tasklists/${taskListId}/tasks/${taskId}`, {
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
): Promise<TaskData> {
   try {
      // get task
      const response = await fetch(`${url}/api/projects/${projectId}/tasklists/${taskListId}/tasks/${taskId}`, {
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
      throw error;
   }
}

//  EDIT TASK helper

export async function editTask(
   projectId: string | undefined,
   taskListId: number,
   task: TaskData,
): Promise<Response> {
   try {
      const token = localStorage.getItem("token");
      const taskId = task.taskId;

      const response = await fetch(`${url}/api/projects/${projectId}/tasklists/${taskListId}/tasks/${taskId}`, {
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
// MOVE TASK TO ANOTHER TASKLIST

export async function moveHandler(projectId: string, taskListId: number, taskId: number, newTaskListId: number): Promise<Response> {
   try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${url}/api/projects/${projectId}/tasklists/${taskListId}/tasks/${taskId}/to/${newTaskListId}`, {
         method: "POST",
         headers: {
            Authorization: `Bearer: ${token}`,
         },
      },
      );

      if (!response.ok) {
         throw new Error("Error occured moving task");
      }

      const jsonData = await response.json();
      return jsonData;
   } catch (error: unknown) {
      console.error("Error moving task: ", error);
      throw error;
   }
}

// REORDER TASK ORDER

export async function reorderTaskOrder(
   projectId: string,
   taskListId: number,
   orderedTaskIds: number[],
): Promise<Response> {
   try {
      const token = localStorage.getItem("token");

      const response = await fetch(
         `${url}/api/projects/${projectId}/tasklists/${taskListId}/task-order`,
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer: ${token}`,
            },
            body: JSON.stringify(orderedTaskIds),
         },
      );

      if (!response.ok) {
         throw new Error("Error occured reordering task list");
      }

      return response;
   } catch (error: unknown) {
      console.error("Error reordering task list: ", error);
      throw error;
   }
}

//Search users by username
export async function searchUsers(keyword: string): Promise<AppUserSummary[]> {
   const token = localStorage.getItem("token");
   const response = await fetch(`${url}/api/users/search/${keyword}`, {
      headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
      },
   });
   if (!response.ok) {
      throw new Error("Error occured searching users");
   }
   return await response.json();
}

//add member to project
export async function addMemberToProject(projectId: string, userId: string): Promise<Response> {
   const token = localStorage.getItem("token");
   const response = await fetch(`${url}/api/projects/${projectId}/members/${userId}`, {
      method: "POST",
      headers: {
         "Content-Type": "Application/json",
         Authorization: `Bearer ${token}`
      },
   });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Error adding member: ${response.status} ${body}`);
   }
   return response;
}

//get current members of project
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
   const token = localStorage.getItem("token");
   const response = await fetch(`${url}/api/projects/${projectId}/members`, {
      headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
      },
   });
   if (!response.ok) {
      throw new Error("Error occured fetching members");
   }
   return await response.json();
}

//delete a member from a project
export async function removeMemberFromProject(projectId: string, userId: number): Promise<Response> {
   const token = localStorage.getItem("token");
   const response = await fetch(`${url}/api/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
      headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
      },
   });
   if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Error removing member: ${response.status} ${body}`);
   }
   return response;
}

// promote a project member to owner
export async function promoteUserToOwner(projectId: string, userId: number): Promise<Response> {
   const token = localStorage.getItem("token");
   const response = await fetch(`${url}/api/projects/${projectId}/members/${userId}/promote-to-owner`, {
      method: "PUT",
      headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
      },
   });
   if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Error promoting member: ${response.status} ${body}`);
   }
   return response;
}
// GET PROJECT DATA (BY ID)

export async function getProjectData(
   token: string | null,
   projectId: string | undefined
): Promise<projectType> {
   const response = await fetch(`${url}/api/projects/${projectId}`, {
      method: "GET",
      headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer: ${token}`,
      },
   });

   if (!response.ok) {
      throw new Error("Failed to fetch project");
   }

   return await response.json();
}

// EDIT PROJECT HELPER

export async function editProject(
   token: string | null,
   projectId: string,
   projectTitle: string,
   description: string,
): Promise<projectType> {
   try {
      const response = await fetch(`${url}/api/projects/${projectId}`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer: ${token}`,
         },
         body: JSON.stringify({
            title: projectTitle.trim(),
            description: description.trim(),
         }),
      });

      if (!response.ok) {
         const body = await response.text().catch(() => "");
         throw new Error(
            `Error occured editing project: ${response.status} ${response.statusText} ${body}`,
         );
      }

      return await response.json();
   } catch (error: unknown) {
      console.error("Error editing project: ", error);
      throw error;
   }
}

// DELETE PROJECT
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
      window.location.reload();
      return response;
   } catch (error) {
      console.error("Failed to delete project", error);
      throw new Error(`Error while deleting`);
   }
}

