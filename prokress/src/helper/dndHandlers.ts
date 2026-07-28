import type React from "react";
import type {
   DragEndEvent,
   DragOverEvent,
   DragStartEvent,
} from "@dnd-kit/core";
import type {TaskListsState, TaskData, PendingMove} from "../helper/types.ts";
import { moveHandler } from "../helper/handler.tsx";

interface CreateDragHandlersProps {
   taskLists: TaskListsState;
   setTaskLists: React.Dispatch<React.SetStateAction<TaskListsState>>;
   setActiveTask: React.Dispatch<React.SetStateAction<TaskData | null>>;
   dragSourceListId: React.MutableRefObject<number | null>;
   pendingMoveRef: React.MutableRefObject<PendingMove | null>;
   projectId?: string;
}

export const parseDndId = (value: string) => {
   const match = value.match(/^(?:task|list)-(\d+)$/);
   return match ? Number(match[1]) : Number(value);
};

export const moveTaskInState = (
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

export function createDragHandlers({
   taskLists,
   setTaskLists,
   setActiveTask,
   dragSourceListId,
   pendingMoveRef,
   projectId,
}: CreateDragHandlersProps) {
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

      if (!projectId || Number.isNaN(taskId) || Number.isNaN(fromListId) || Number.isNaN(targetListId)) {
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
         await moveHandler(projectId, fromListId, taskId, targetListId);
      } catch (error) {
         console.error("Move failed", error);
      } finally {
         dragSourceListId.current = null;
         setActiveTask(null);
      }
   };
   return {
      handleDragStart,
      handleDragOver,
      handleDragEnd,
   };
}
