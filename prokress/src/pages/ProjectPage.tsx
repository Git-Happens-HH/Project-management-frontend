import TaskList from "../Components/TaskList.tsx";
import Task from "../Components/Task.tsx";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
   createNewTasklist,
   deleteTasklist,
   getProjectMembers,
   getTaskData,
   removeMemberFromProject,
   transformTaskLists,
} from "../helper/handler.tsx";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import {
   DndContext,
   closestCorners,
   DragOverlay,
   pointerWithin,
   type CollisionDetection,
} from "@dnd-kit/core";
import {
   SortableContext,
   verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskDialog from "../Components/TaskDialog.tsx";
import ContextMenu from "../Components/ContextMenu.tsx";
import EditTaskDialog from "../Components/TaskEditDialog.tsx";
import { createDragHandlers, moveTaskInState } from "../helper/dndHandlers.ts";
import type {
   PendingMove,
   TaskListsState,
   TaskData,
   ProjectMember,
} from "../helper/types.ts";
import { API_URL } from "../config";
import "../App.css";
import AddMemberDialog from "../Components/AddMemberDialog.tsx";
import { Menu, Button } from "@material-tailwind/react";

const taskDndId = (taskId: number) => `task-${taskId}`;
const listDndId = (taskListId: number) => `list-${taskListId}`;

// Dopdown functionalities for seeing project members and adding new members

function toggleProjectMemberListDropdown() {
   const menu = document.getElementById("memberListDropdown");

   if (!menu) return;

   menu.classList.toggle("hidden");
}


// Close when clicking outside
window.addEventListener("click", (e: MouseEvent): void => {
   const menu = document.getElementById("memberListDropdown");
   const button = (e.target as HTMLElement | null)?.closest("button");

   if (!menu) return;

   if (!button && !menu.contains(e.target as Node)) {
      menu.classList.add("hidden");
   }
});

const collisionDetection: CollisionDetection = (args) => {
   const pointerCollisions = pointerWithin(args);

   if (pointerCollisions.length > 0) {
      return pointerCollisions;
   }

   return closestCorners(args);
};

function ProjectPage() {
   const url: string = API_URL;

   let { id } = useParams<{ id: string }>();
   const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
   const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] =
      useState<boolean>(false);
   const [isAddMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
   const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);

   const [taskListId, setTaskListId] = useState<number>(0);
   const [activeTask, setActiveTask] = useState<TaskData | null>(null);
   const projectId: string | undefined = id;

   const [memberList, setMemberList] = useState<ProjectMember[]>([]);

   const handleEditClick = async (taskId: number, listId: number) => {
      setTaskListId(listId);
      const token = localStorage.getItem("token");
      const task = await getTaskData(token, projectId, listId, taskId);
      setSelectedTask(task);
      setIsEditTaskDialogOpen(true);
   };

   const closeEditDialog = () => {
      setIsEditTaskDialogOpen(false);
      setSelectedTask(null);
   };

   //context menu block
   const [contextMenuMode, setContextMenuMode] = useState<
      "project" | "task" | null
   >(null);
   const [contextMenuId, setContextMenuId] = useState<number>(0);
   const [pos, setPos] = useState({ x: 0, y: 0 });
   const dragSourceListId = useRef<number | null>(null);
   const pendingMoveRef = useRef<PendingMove | null>(null);
   // end of context menu block

   let stompClient = useRef<Client | null>(null);
   let subscription = useRef<StompSubscription | null>(null);
   const pendingProjectId = useRef<string | null>(null);
   const [taskLists, setTaskLists] = useState<TaskListsState>({});
   const [currUserRole, setCurrUserRole] = useState<string | null>(null);

   const { handleDragStart, handleDragOver, handleDragEnd } = createDragHandlers(
      {
         taskLists,
         setTaskLists,
         setActiveTask,
         dragSourceListId,
         pendingMoveRef,
         projectId: id,
      },
   );
   const newTaskList = () => {
      const token = localStorage.getItem("token");
      let taskListTitle = prompt("New TaskList title", "TODO");
      if (token && id && taskListTitle) {
         createNewTasklist(token, id, taskListTitle);
      }
   };

   const deleteTaskList = (taskListId: number) => {
      const token = localStorage.getItem("token");
      if (token && id) {
         if (confirm("Do you really want to delete this tasklist?")) {
            deleteTasklist(token, id, taskListId);
         }
      }
   };

   const deleteMember = async (member: ProjectMember) => {
      const token = localStorage.getItem("token");
      if (!token || !id) return;

      const username = `${member.username ?? ""}`;

      if (!confirm(`Do you really want to remove ${username} from the project?`)) return;

      try {
         await removeMemberFromProject(id, member.appUserId);
         const updatedMembers = await getProjectMembers(id);
         setMemberList(updatedMembers);
      } catch (error) {
         alert("Could not remove member from project")
      }
   }

   const syncTaskLists = (nextTaskLists: TaskListsState) => {
      setTaskLists(nextTaskLists);
   };

   const openProject = async (projectId: string) => {

      const token = localStorage.getItem("token");

      // TEMPORARY PLEASE DELETE!!!
      console.log("token:", token);


      if (!token) return;
      pendingProjectId.current = projectId;
      const res = await fetch(url + `/api/projects/${projectId}/tasklists`, {
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer: ${token}`,
         },
      });
      const data = await res.json();
      const transformed: TaskListsState = transformTaskLists(data);
      syncTaskLists(transformed);

      if (!stompClient.current) {
         const socket = new SockJS(url + "/ws");
         const client = new Client({
            webSocketFactory: () => socket,
            debug: () => undefined,
            onConnect: () => {
               if (pendingProjectId.current) {
                  subscribeToProject(pendingProjectId.current);
               }
            },
            onStompError: (frame) => {
               console.error(frame);
            },
         });
         client.activate();
         stompClient.current = client;
      } else if (stompClient.current.connected) {
         subscribeToProject(projectId);
      }

      const members = await getProjectMembers(projectId);
      setMemberList(members);

      if (!token) return;

      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentUserEmail = payload.sub;

      const currentMember = members.find(
         (member) => member.email === currentUserEmail
      );

      setCurrUserRole(currentMember?.role ?? null);
   };

   function subscribeToProject(projectId: string) {
      if (!stompClient.current) return;
      subscription.current?.unsubscribe();
      subscription.current = stompClient.current.subscribe(
         `/topic/project/${projectId}`,
         (msg: IMessage) => {
            let transformed: TaskListsState = transformTaskLists(
               JSON.parse(msg.body),
            );

            if (pendingMoveRef.current) {
               transformed = moveTaskInState(
                  transformed,
                  pendingMoveRef.current.sourceListId,
                  pendingMoveRef.current.targetListId,
                  pendingMoveRef.current.taskId,
                  pendingMoveRef.current.targetIndex,
               );
               pendingMoveRef.current = null;
            }

            syncTaskLists(transformed);
         },
      );
   }
   useEffect(() => {
      if (id) {
         openProject(id);
      }
      return () => {
         subscription.current?.unsubscribe();
         stompClient.current?.deactivate();
      };
   }, [id]);

   return (
      <div className="flex flex-col min-h-screen items-center bg-(--prokress-beige-100)">
         <div
            id="projectButtons"
            className="relative flex flex-row h-20 w-[75%] p-2 items-center justify-between"
         >
            <div className="flex flex-row gap-2">
               <a
                  href="/projects"
                  className="w-14 bg-(--prokress-violet) hover:bg-(--prokress-orange) text-white font-bold py-2 px-4 rounded"
               >
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     height="24px"
                     viewBox="0 -960 960 960"
                     width="29px"
                     fill="#e3e3e3"
                  >
                     <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                  </svg>
               </a>
               <button
                  onClick={newTaskList}
                  className="w-20 bg-(--prokress-violet) hover:bg-(--prokress-orange) text-white font-bold py-2 px-4 rounded"
               >
                  Add
               </button>
            </div>
            <div>

            </div>
            <div className="relative">
               <button
                  onClick={toggleProjectMemberListDropdown}
                  className="border-2 rounded-full w-14 h-14 px-3 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
               >
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     height="24px"
                     viewBox="0 -960 960 960"
                     width="24px"
                     fill="#000000"
                  >
                     <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z" />
                  </svg>
               </button>
               <div
                  id="memberListDropdown"
                  className="hidden absolute right-0 z-20 mt-3 min-w-[18rem] max-w-sm rounded-2xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-lg"
               >

                  <div className="px-4 py-3 border-b border-slate-200/70">
                     <p className="text-sm font-semibold text-(--prokress-black-700)">
                        Project members
                     </p>
                     <button onClick={() => setAddMemberDialogOpen(true)}>Add member</button>
                     <p className="text-xs text-slate-500">
                        {memberList.length} member(s)
                     </p>
                  </div>
                  <ul role="list" className="divide-y divide-slate-200/70">
                     {memberList.map((member) => {
                        const canDeleteMember =
                           currUserRole === "owner" && member.role !== "owner";

                        return (
                           <li
                              key={member.appUserId}
                              className="px-4 py-3 hover:bg-(--prokress-beige-50) transition-colors duration-150"
                           >
                              <div className="flex items-center justify-between gap-3">
                                 <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--prokress-violet)/10 text-(--prokress-violet)">
                                       {member.firstName?.[0] ?? "?"}
                                       {member.lastName?.[0] ?? ""}
                                    </div>

                                    <div className="min-w-0">
                                       <p className="text-sm font-semibold text-(--prokress-black-700)">
                                          {member.firstName} {member.lastName}
                                       </p>
                                       <p className="truncate text-xs text-slate-500">
                                          {member.email}
                                       </p>
                                       <div className="mt-1 text-xs font-medium uppercase tracking-wide text-(--prokress-orange)">
                                          {member.role}
                                       </div>
                                    </div>
                                 </div>

                                 {canDeleteMember && (
                                    <div>
                                       <Menu>
                                          <Menu.Trigger className="rounded-full hover:bg-(--prokress-orange) p-1"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg></Menu.Trigger>
                                          <Menu.Content className="bg-(--prokress-beige-0) shadow-2xl shadow-black z-50 w-15 p-0.5">
                                             <Menu.Item className="h-5 justify-center p-4 hover:bg-(--prokress-orange)">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#1f1f1f"><path d="M200-160v-80h560v80H200Zm0-140-51-321q-2 0-4.5.5t-4.5.5q-25 0-42.5-17.5T80-680q0-25 17.5-42.5T140-740q25 0 42.5 17.5T200-680q0 7-1.5 13t-3.5 11l125 56 125-171q-11-8-18-21t-7-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820q0 15-7 28t-18 21l125 171 125-56q-2-5-3.5-11t-1.5-13q0-25 17.5-42.5T820-740q25 0 42.5 17.5T880-680q0 25-17.5 42.5T820-620q-2 0-4.5-.5t-4.5-.5l-51 321H200Zm68-80h424l26-167-105 46-133-183-133 183-105-46 26 167Zm212 0Z" /></svg>
                                             </Menu.Item>
                                             <Menu.Item className="h-5 justify-center p-4 hover:bg-(--prokress-orange)" onClick={() => deleteMember(member)}><svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                height="30px"
                                                viewBox="0 -960 960 960"
                                                width="30px"
                                                fill="#1f1f1f"
                                             >
                                                <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z" />
                                             </svg>
                                             </Menu.Item>
                                          </Menu.Content>
                                       </Menu>
                                    </div>
                                 )}
                              </div>
                           </li>
                        );
                     })}
                  </ul>
               </div>
            </div>
         </div>
         <DndContext
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
         >
            <div
               id="taskListContainer"
               className="flex min-h-[70%] w-[76%] gap-2 p-3 overflow-auto bg-(--prokress-beige-50) rounded-2xl shadow scrollbar"
            >
               {Object.entries(taskLists).map(([, taskList]) => {
                  const uniqueTasks = Array.from(
                     new Map(
                        taskList.tasks.map((task) => [task.taskId, task]),
                     ).values(),
                  );

                  return (
                     <TaskList
                        key={taskList.taskListId}
                        id={listDndId(taskList.taskListId)}
                        taskListTitle={taskList.title}
                        taskCount={uniqueTasks.length}
                     >
                        <SortableContext
                           items={uniqueTasks.map((task) => taskDndId(task.taskId))}
                           strategy={verticalListSortingStrategy}
                        >
                           {uniqueTasks.map((task, index) => (
                              <Task
                                 key={task.taskId}
                                 id={taskDndId(task.taskId)}
                                 taskId={task.taskId}
                                 listId={taskList.taskListId}
                                 index={index}
                                 column={taskList.taskListId}
                                 title={task.title}
                                 description={task.description}
                                 onContextMenu={(e) => {
                                    e.preventDefault();
                                    setContextMenuMode("task");
                                    setContextMenuId(task.taskId);
                                    setTaskListId(taskList.taskListId);
                                    setPos({ x: e.pageX, y: e.pageY });
                                 }}
                              />
                           ))}
                        </SortableContext>
                        <div className="absolute top-[88%] flex flex-row gap-2">
                           <div
                              onClick={() => {
                                 deleteTaskList(taskList.taskListId);
                              }}
                              className=" text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500) hover:bg-red-500 z-10"
                           >
                              <svg
                                 xmlns="http://www.w3.org/2000/svg"
                                 height="24px"
                                 viewBox="0 -960 960 960"
                                 width="24px"
                                 fill="#e3e3e3"
                              >
                                 <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z" />
                              </svg>
                           </div>
                           <div
                              onClick={() => {
                                 setIsDialogOpen(true);
                                 setTaskListId(taskList.taskListId);
                              }}
                              className=" text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500) hover:bg-(--prokress-orange) z-10"
                           >
                              <svg
                                 xmlns="http://www.w3.org/2000/svg"
                                 height="24px"
                                 viewBox="0 -960 960 960"
                                 width="24px"
                                 fill="#fff"
                              >
                                 <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                              </svg>
                           </div>
                        </div>
                     </TaskList>
                  );
               })}
            </div>
            <DragOverlay>
               {activeTask && (
                  <div className="flex flex-col rounded w-[330px] h-32 p-2 border-solid border-black border-2 text-(--prokress-black-700) my-2 bg-(--prokress-beige-0) shadow-2xl opacity-95 overflow-hidden">
                     <div className="flex pb-1">
                        <p className="w-9/10 text-md">{activeTask.title}</p>
                        <button
                           className="rounded-full w-0.8/10 hover:bg-gray-100 p-0.2"
                           tabIndex={-1}
                           aria-hidden="true"
                        >
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24px"
                              viewBox="0 -960 960 960"
                              width="24px"
                              fill="#00000"
                           >
                              <path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z" />
                           </svg>
                        </button>
                     </div>
                     <div className="border-t pt-1">
                        <p>{activeTask.description}</p>
                     </div>
                  </div>
               )}
            </DragOverlay>
         </DndContext>

         <TaskDialog
            isOpen={isDialogOpen}
            taskListId={taskListId}
            toggleDialog={() => setIsDialogOpen(false)}
            projectId={projectId}
         />
         <EditTaskDialog
            isOpen={isEditTaskDialogOpen}
            taskListId={taskListId}
            toggleDialog={closeEditDialog}
            projectId={projectId}
            task={selectedTask}
         />
         <AddMemberDialog
            isOpen={isAddMemberDialogOpen}
            toggleDialog={() => setAddMemberDialogOpen(false)}
         />
         {contextMenuMode === "task" && projectId && (
            <ContextMenu
               isOpen={true}
               mode={contextMenuMode}
               toggleContextMenu={() => setContextMenuMode(null)}
               onEditTask={handleEditClick}
               positions={pos}
               projectId={projectId}
               taskListId={taskListId}
               contextMenuId={contextMenuId}
            />
         )}
         {contextMenuMode === "project" && projectId && (
            <ContextMenu
               isOpen={true}
               mode="project"
               toggleContextMenu={() => setContextMenuMode(null)}
               positions={pos}
               contextMenuId={contextMenuId}
            />
         )}

      </div>
   );
}

export default ProjectPage;
