import { useState, useEffect } from "react";
import { editTask } from "../helper/handler";
import type { Task } from "../helper/types.ts";

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
         className="fixed inset-0 z-999 grid h-screen w-screen place-items-center bg-opacity-60 backdrop-blur-xs transition-opacity duration-300"
      >
         <div
            onClick={(e) => e.stopPropagation()}
            className="relative mx-auto w-full max-w-[24rem] rounded-lg overflow-hidden shadow-sm bg-white"
         >

            <form
               onSubmit={handleSubmit}
               className="relative flex flex-col bg-white"
            >
            <div className="relative m-2.5 items-center flex justify-center text-white h-24 rounded-md bg-(--prokress-violet)">
               <h3 className="text-2xl font-semibold">{"Edit Task"}</h3>
            </div>
               <div className="flex flex-col gap-4 p-6">
                  <div className="w-full max-w-sm min-w-50">
                     <label className="block mb-2 text-sm text-slate-600 font-medium">
                        Title
                     </label>
                     <input
                        value={taskData.title}
                        className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                        onChange={(e) =>
                           setTaskData({ ...taskData, title: e.target.value })
                        }
                     />
                  </div>
               </div>
               <div className="flex flex-col gap-4 p-6">
                  <div className="w-full max-w-sm min-w-50">
                     <label className="block mb-2 text-sm text-slate-600 font-medium">
                        Description
                     </label>
                     <input
                        value={taskData.description}
                        className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                        onChange={(e) =>
                           setTaskData({
                              ...taskData,
                              description: e.target.value,
                           })
                        }
                     />
                  </div>
               </div>
               <div className="flex flex-col gap-4 p-6">
                  <div className="w-full max-w-sm min-w-50">
                     <label className="block mb-2 text-sm text-slate-600 font-medium">
                        Deadline
                     </label>
                     <input
                        type="date"
                        value={taskData.deadline}
                        className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                        onChange={(e) =>
                           setTaskData({
                              ...taskData,
                              deadline: e.target.value,
                           })
                        }
                     />
                  </div>
               </div>
               <div className="p-6 pt-0">
                        <button
                            type="submit"
                            className="w-full rounded-md bg-(--prokress-violet) py-2.5 px-4 text-center text-sm font-semibold text-white hover:bg-(--prokress-orange) transition-all"
                        >
                            Save
                        </button>
                    </div>
            </form>
         </div>
      </div>
   );
};

export default EditTaskDialog;
