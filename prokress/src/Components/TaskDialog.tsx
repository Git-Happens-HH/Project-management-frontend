import { useState, type SubmitEvent } from "react";
import { createNewTask } from "../helper/handler";
import { useParams } from "react-router";

interface DialogProps {
  isOpen: boolean;
  taskListId: number;
  toggleDialog: () => void;
}

const TaskDialog: React.FC<DialogProps> = ({
  isOpen,
  taskListId,
  toggleDialog,
}) => {
  const { id } = useParams<{ id: string }>(); // ProjectId
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    deadline: new Date(),
  });
  if (!isOpen) return null;

  const handleSubmit = async (e: SubmitEvent, id: string) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (
        token &&
        id &&
        taskData.title &&
        taskData.description &&
        taskListId &&
        taskData.deadline
      ) {
        createNewTask(
          token,
          id,
          taskListId,
          taskData.title,
          taskData.description,
          taskData.deadline,
        );
      }
      toggleDialog();
    } catch (error) {
      console.error("Task creation failed:", error);
    }
  };

  return (
    <div
      onClick={toggleDialog} /*Close dialog when clicking outside */
      className="fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-opacity-60 backdrop-blur-xs transition-opacity duration-300"
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        } /* Prevents closing when clicking inside the dialog */
        className="relative mx-auto w-full max-w-[24rem] rounded-lg overflow-hidden shadow-sm bg-white"
      >
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col bg-white"
        >
          <div className="relative m-2.5 items-center flex justify-center text-white h-24 rounded-md bg-(--prokress-violet)">
            <h3 className="text-2xl font-semibold">{"Create a Task"}</h3>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="w-full max-w-sm min-w-[200px]">
              <label className="block mb-2 text-sm text-slate-600 font-medium">
                Title
              </label>
              <input
                required /* mandatory field */
                type="text"
                className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                onChange={(e) =>
                  setTaskData({ ...taskData, title: e.target.value })
                }
              />
            </div>

            <div className="w-full max-w-sm min-w-[200px]">
              <label className="block mb-2 text-sm text-slate-600 font-medium">
                Description
              </label>
              <input
                required /* mandatory field */
                type="text"
                className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                onChange={(e) =>
                  setTaskData({ ...taskData, description: e.target.value })
                }
              />
            </div>

            <div className="w-full max-w-sm min-w-[200px]">
              <label className="block mb-2 text-sm text-slate-600 font-medium">
                Deadline
              </label>
              <input
                required /* mandatory field */
                type="date"
                className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                onChange={(e) =>
                  setTaskData({ ...taskData, deadline: e.target.value })
                }
              />
            </div>
          </div>
          <div className="p-6 pt-0">
            <button
              type="submit"
              className="w-full rounded-md bg-(--prokress-violet) py-2.5 px-4 text-center text-sm font-semibold text-white hover:bg-(--prokress-orange) transition-all"
            >
              Add new task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDialog;
