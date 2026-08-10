import { useEffect, useState } from "react";
import { editProject } from "../helper/handler.tsx";
import type { projectType } from "../helper/types.ts";

interface Props {
   isOpen: boolean;
   toggleDialog: () => void;
   project: projectType | null;
   onSaved?: () => void;
}

const ProjectEditDialog: React.FC<Props> = ({
   isOpen,
   toggleDialog,
   project,
   onSaved,
}) => {
   const [projectData, setProjectData] = useState({
      title: "",
      description: "",
   });

   useEffect(() => {
      if (!project) return;

      setProjectData({
         title: project.title,
         description: project.description,
      });
   }, [project]);

   if (!isOpen) return null;
   if (!project) return <div>Loading...</div>;

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
         const token = localStorage.getItem("token");
         await editProject(token, project.projectId, projectData.title, projectData.description);
         onSaved?.();
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
            className="relative mx-auto w-full max-w-md rounded-lg overflow-hidden shadow-sm bg-white"
         >
            <form onSubmit={handleSubmit} className="relative flex flex-col bg-white">
               <div className="relative m-2.5 items-center flex justify-center text-white h-20 rounded-md bg-(--prokress-violet)">
                  <h3 className="text-2xl font-semibold">Edit Project</h3>
               </div>

               <div className="flex flex-col gap-4 p-6">
                  <div className="w-full max-w-full">
                     <label className="block mb-2 text-sm text-slate-600 font-medium">Project Name</label>
                     <input
                        required
                        type="text"
                        value={projectData.title}
                        className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                        onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                     />
                  </div>

                  <div className="w-full max-w-full">
                     <label className="block mb-2 text-sm text-slate-600 font-medium">Description</label>
                     <textarea
                        value={projectData.description}
                        className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950 resize-y"
                        onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                     />
                  </div>
               </div>

               <div className="p-6 pt-0 flex gap-3">
                  <button
                     type="submit"
                     className="flex-1 rounded-md bg-(--prokress-violet) py-2.5 px-4 text-center text-sm font-semibold text-white hover:bg-(--prokress-violet) transition-all"
                  >
                     Save
                  </button>
                  <button
                     type="button"
                     onClick={toggleDialog}
                     className="flex-1 rounded-md border border-slate-300 py-2.5 px-4 text-center text-sm font-semibold text-slate-800 hover:opacity-90"
                  >
                     Cancel
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default ProjectEditDialog;