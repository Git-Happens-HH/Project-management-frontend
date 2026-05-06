import { useState, useEffect, type SubmitEvent } from "react";
import { editTask } from "../helper/handler";
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
  console.log("The task that was passed is: ", task);
  const [taskData, setTaskData] = useState({
    taskId: 0,
    title: "",
    description: "",
    deadline: "",
  });

  useEffect(() => {
    if (!task) return;
    setTaskData({
      taskId: task.taskId,
      title: task.title,
      description: task.description,
      deadline: task.deadline?.split("T")[0],
    });
    console.log("Task data that was set: ", taskData);
  }, [task]);

  if (!isOpen) return null;
  if (!task) return <div>Loading...</div>;

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
