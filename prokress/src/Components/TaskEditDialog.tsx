import { useState, useEffect, type SubmitEvent } from "react";
import { editTask, getTaskData } from "../helper/handler";
import type { Task } from "../pages/ProjectPage";

interface Props {
  isOpen: boolean;
  toggleDialog: () => void;
  projectId: string | undefined;
  taskListId: number;
  task: Task | null;
}

const EditTaskDialog: React.FC<Props> = ({
  isOpen,
  toggleDialog,
  projectId,
  taskListId,
  task,
}) => {
  const [taskData, setTaskData] = useState({
    taskId: task?.taskId || 0,
    title: task?.title || "",
    description: task?.description || "",
    deadline: task?.deadline?.split("T")[0] || "",
  });

  // useEffect(() => {
  //     if (isOpen && task) {
  //         setTaskData({
  //             title: task.title || "",
  //             description: task.description || "",
  //             deadline: task.deadline?.split("T")[0] || "",
  //         });
  //     }
  // }, [isOpen, task]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await editTask(projectId, taskListId, taskData);

      toggleDialog();
    } catch (error) {
      console.error("Edit failed:", error);
    }
  };

  return (
    <div
      onClick={toggleDialog}
      className="fixed inset-0 grid place-items-center bg-opacity-60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-6 rounded-lg"
      >
        <h2>Edit Task</h2>

        <form onSubmit={handleSubmit}>
          <input
            value={taskData.title}
            onChange={(e) =>
              setTaskData({ ...taskData, title: e.target.value })
            }
          />

          <input
            value={taskData.description}
            onChange={(e) =>
              setTaskData({ ...taskData, description: e.target.value })
            }
          />

          <input
            type="date"
            value={taskData.deadline}
            onChange={(e) =>
              setTaskData({ ...taskData, deadline: e.target.value })
            }
          />

          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
};

export default EditTaskDialog;
