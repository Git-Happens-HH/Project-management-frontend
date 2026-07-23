import TaskList from "../Components/TaskList.tsx";
import Task from "../Components/Task.tsx";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
   createNewTasklist,
   deleteTasklist,
   getTaskData,
   moveHandler,
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
   type DragEndEvent,
   type DragOverEvent,
   type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskDialog from "../Components/TaskDialog.tsx";
import ContextMenu from "../Components/ContextMenu.tsx";
import EditTaskDialog from "../Components/TaskEditDialog.tsx";

export interface Task {
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

type TaskListsState = Record<number, TaskList>;

type PendingMove = {
   sourceListId: number;
   targetListId: number;
   taskId: number;
   targetIndex?: number;
};

const taskDndId = (taskId: number) => `task-${taskId}`;
const listDndId = (taskListId: number) => `list-${taskListId}`;

const parseDndId = (value: string) => {
   const match = value.match(/^(?:task|list)-(\d+)$/);
   return match ? Number(match[1]) : Number(value);
};

const collisionDetection: CollisionDetection = (args) => {
   const pointerCollisions = pointerWithin(args);

   if (pointerCollisions.length > 0) {
      return pointerCollisions;
   }

   return closestCorners(args);
};

function ProjectPage() {
   //const url: string =
   //  "https://project-management-app-prokress-backend.2.rahtiapp.fi";
   const url: string = "http://localhost:8080";

   let { id } = useParams<{ id: string }>();
   const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
   const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] =
      useState<boolean>(false);
   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

   const [taskListId, setTaskListId] = useState<number>(0);
   const [activeTask, setActiveTask] = useState<Task | null>(null);
   const projectId: string | undefined = id;

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
         if (confirm("Do you really want to delete!")) {
            deleteTasklist(token, id, taskListId);
         }
      }
   };

   const syncTaskLists = (nextTaskLists: TaskListsState) => {
      setTaskLists(nextTaskLists);
   };

   const moveTaskInState = (
      state: TaskListsState,
      sourceListId: number,
      targetListId: number,
      taskId: number,
      targetIndex?: number
   ) => {
      const next = { ...state };
      const sourceList = next[sourceListId];
      const targetList = next[targetListId];

      if (!sourceList || !targetList) {
         return state;
      }

      const sourceTasks = [...sourceList.tasks];
      const taskToMove = sourceTasks.find((task) => task.taskId === taskId);
      const sourceIndex = sourceTasks.findIndex((task) => task.taskId === taskId);

      if (!taskToMove) {
         return state;
      }

      const nextSourceTasks = sourceTasks.filter((task) => task.taskId !== taskId);

      if (sourceListId === targetListId) {
         const reorderedTasks = [...nextSourceTasks];
         const normalizedTargetIndex = typeof targetIndex === "number" ? targetIndex : reorderedTasks.length;
         const insertIndex =
            sourceIndex >= 0 && normalizedTargetIndex > sourceIndex
               ? normalizedTargetIndex - 1
               : normalizedTargetIndex;

         reorderedTasks.splice(insertIndex, 0, taskToMove);
         next[sourceListId] = { ...sourceList, tasks: reorderedTasks };
         return next;
      }

      const nextTargetTasks = [...targetList.tasks];
      const insertIndex = typeof targetIndex === "number" ? targetIndex : nextTargetTasks.length;
      nextTargetTasks.splice(insertIndex, 0, taskToMove);

      next[sourceListId] = { ...sourceList, tasks: nextSourceTasks };
      next[targetListId] = { ...targetList, tasks: nextTargetTasks };
      return next;
   };

   const openProject = async (projectId: string) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      pendingProjectId.current = projectId;
      const res = await fetch(
         url + `/api/projects/${projectId}/tasklists`,
         {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer: ${token}`,
            },
         }
      );
      const data = await res.json();
      const transformed: TaskListsState = transformTaskLists(data);
      syncTaskLists(transformed);

      if (!stompClient.current) {
         const socket = new SockJS(
            url + "/ws"
         );
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
   };

   function subscribeToProject(projectId: string) {
      if (!stompClient.current) return;
      subscription.current?.unsubscribe();
      subscription.current = stompClient.current.subscribe(
         `/topic/project/${projectId}`,
         (msg: IMessage) => {
            let transformed: TaskListsState = transformTaskLists(
               JSON.parse(msg.body)
            );

            if (pendingMoveRef.current) {
               transformed = moveTaskInState(
                  transformed,
                  pendingMoveRef.current.sourceListId,
                  pendingMoveRef.current.targetListId,
                  pendingMoveRef.current.taskId,
                  pendingMoveRef.current.targetIndex
               );
               pendingMoveRef.current = null;
            }

            syncTaskLists(transformed);
         }
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


   const updateTaskListsFromMove = (
      sourceListId: number,
      targetListId: number,
      taskId: number,
      targetIndex?: number
   ) => {
      setTaskLists((prev) => moveTaskInState(prev, sourceListId, targetListId, taskId, targetIndex));
   };

   const handleDragOver = (event: DragOverEvent) => {
      const taskId = Number(event.active.data.current?.taskId ?? parseDndId(String(event.active.id)));
      const fromListId = dragSourceListId.current ?? Number(event.active.data.current?.listId);
      const targetListId = Number(event.over?.data.current?.listId ?? (event.over?.id ? parseDndId(String(event.over.id)) : NaN));
      const overType = event.over?.data.current?.type as string | undefined;
      const activeRect = event.active.rect.current.translated;
      const overRect = event.over?.rect;
      const isBelowOverItem =
         Boolean(activeRect && overRect) &&
         activeRect!.top + activeRect!.height / 2 > overRect!.top + overRect!.height / 2;

      const targetIndex =
         overType === "list"
            ? taskLists[targetListId]?.tasks.length ?? 0
            : (() => {
                 const overIndex = event.over?.data.current?.index as number | undefined;
                 if (typeof overIndex !== "number") {
                    return undefined;
                 }

                 return overIndex + (isBelowOverItem ? 1 : 0);
              })();

      if (Number.isNaN(taskId) || Number.isNaN(fromListId) || Number.isNaN(targetListId)) {
         return;
      }

      pendingMoveRef.current = {
         sourceListId: fromListId,
         targetListId,
         taskId,
         targetIndex,
      };

      updateTaskListsFromMove(fromListId, targetListId, taskId, targetIndex);
   };

   const handleDragStart = (event: DragStartEvent) => {
      dragSourceListId.current = Number(event.active.data.current?.listId);
      setActiveTask({
         taskId: Number(event.active.data.current?.taskId ?? event.active.id),
         title: String(event.active.data.current?.title ?? ""),
         description: String(event.active.data.current?.description ?? ""),
         deadline: String(event.active.data.current?.deadline ?? ""),
      });
   };

   const handleDragEnd = async (event: DragEndEvent) => {
      const taskId = Number(event.active.data.current?.taskId ?? parseDndId(String(event.active.id)));
      const fromListId = dragSourceListId.current ?? Number(event.active.data.current?.listId);
      const targetListId = Number(event.over?.data.current?.listId ?? (event.over?.id ? parseDndId(String(event.over.id)) : NaN));

      if (!id || Number.isNaN(taskId) || Number.isNaN(fromListId) || Number.isNaN(targetListId)) {
         return;
      }

      if (fromListId === targetListId) {
         dragSourceListId.current = null;
         pendingMoveRef.current = null;
         return;
      }

      try {
         pendingMoveRef.current = {
            sourceListId: fromListId,
            targetListId,
            taskId,
            targetIndex: pendingMoveRef.current?.targetIndex,
         };
         await moveHandler(id, fromListId, taskId, targetListId);
      } catch (error) {
         console.error("Move failed", error);
      } finally {
         dragSourceListId.current = null;
         setActiveTask(null);
      }
   };

   return (
      <div className="flex flex-col min-h-screen items-center bg-(--prokress-beige-100)">
         <div
            id="projectButtons"
            className="flex flex-row h-20 w-[75%] p-2 items-center justify-between"
         >
            <div className="flex frex-row gap-2">
               <a
                  href="/projects"
                  className="w-14 bg-(--prokress-violet) hover:bg-(--prokress-orange) text-white font-bold py-2 px-4 rounded"
               >
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     height="24px"
                     viewBox="0 -960 960 960"
                     width="24px"
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
            <button className="border-2 rounded-full w-14 h-14 px-3">
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
         </div>
         <DndContext
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
         >
            <div
               id="taskListContainer"
               className="flex min-h-[70%] w-[76%] gap-2 p-3 overflow-auto bg-(--prokress-beige-50) rounded-2xl shadow"
            >
               {Object.entries(taskLists).map(([, taskList]) => {
                  const uniqueTasks = Array.from(
                     new Map(taskList.tasks.map((task) => [task.taskId, task])).values()
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
                              className=" text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500) hover:bg-red-500"
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
                              className=" text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500) hover:bg-red-500"
                           >
                              <svg
                                 xmlns="http://www.w3.org/2000/svg"
                                 height="24px"
                                 viewBox="0 -960 960 960"
                                 width="24px"
                                 fill="#fff"
                              >
                                 <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                              </svg>{" "}
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
                           <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00000"><path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z"/></svg>
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
