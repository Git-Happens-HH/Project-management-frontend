import ProjectCard from '../Components/ProjectCard.tsx'
import ProjectDialogCreation from '../Components/ProjectDialogCreation'
import ProjectEditDialog from '../Components/ProjectEditDialog.tsx'
import { useState, useEffect } from 'react'
import { getProjectsForUser } from '../helper/handler.tsx'
import type { projectType } from '../helper/types.ts'
import ContextMenu from '../Components/ContextMenu.tsx'
import '../App.css'
function ProjectsPage() {
   // contextMenu
   const [contextMenuMode, setContextMenuMode] = useState<"project" | "task" | null>(null);
   const [contextMenuId, setContextMenuId] = useState<number>(0);
   const [pos, setPos] = useState({ x: 0, y: 0 });

   // rest of app
   const [myProjects, setMyProjects] = useState<projectType[]>([]);
   const [sharedProjects, setSharedProjects] = useState<projectType[]>([]);
   const [isProjectDialogOpen, setProjectDialogOpen] = useState(false)
   const [isEditProjectDialogOpen, setEditProjectDialogOpen] = useState(false)
   const [selectedProject, setSelectedProject] = useState<projectType | null>(null)
   const appUserId = localStorage.getItem('token')
   const fetchProjects = async (): Promise<void> => {
      try {
         const response: projectType[] = await getProjectsForUser(appUserId);
         const tempSharedProjects: projectType[] = [];
         const tempMyProjects: projectType[] = [];
         for (const project of response) {
            if (project.role === "member") {
               tempSharedProjects.push(project)
            } else (
               tempMyProjects.push(project)
            )
         }
         setSharedProjects(tempSharedProjects)
         setMyProjects(tempMyProjects)
      } catch (err: unknown) {
         if (err instanceof Error) {
            console.error(err.message)
         } else {
            console.error("Unknown error", err)
         }
      }
   };

   useEffect(() => {
      fetchProjects();
   }, []);

   const openEditProjectDialog = (projectId: number) => {
      const foundProject = [...myProjects, ...sharedProjects].find((project) => Number(project.projectId) === projectId);

      if (!foundProject) {
         return;
      }

      setSelectedProject(foundProject);
      setContextMenuMode(null);
      setEditProjectDialogOpen(true);
   };

   const closeEditProjectDialog = () => {
      setEditProjectDialogOpen(false);
      setSelectedProject(null);
   };

   return (
      <div className="flex flex-col min-h-screen items-center bg-(--prokress-beige-100)">
         <div className="w-90 md:w-2xl xl:w-7xl rounded-3xl mt-[5%] h-80 bg-(--prokress-beige-50) shadow-md">
            <div className="bg-(--prokress-beige-0) rounded-t-3xl pt-2 pl-4 pb-2"><p className="text-(--prokress-black-700) text-2xl font-bold">Omat projektit</p></div>
            <div className="flex flex-row gap-x-2 ml-4 mr-4 overflow-auto scrollbar">
               {myProjects.map((project, index) => {
                  return (
                     <div key={index}
                        id={project.projectId}
                        onContextMenu={(e) => {
                           e.preventDefault();
                           setContextMenuMode("project");
                           setContextMenuId(parseInt(e.currentTarget.id));
                           setPos({ x: e.pageX, y: e.pageY });
                        }}>
                        <ProjectCard project={project} index={index} />
                     </div>
                  )
               })}
               <div onClick={() => { setProjectDialogOpen(true); }}
                  className="min-w-80 h-55 rounded-lg mt-4 m-2 bg-(--prokress-beige-0) text-(--prokress-black-700) shadow-md flex justify-center items-center">
                  <div className="text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500)"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg></div>
               </div>
            </div>
         </div>
         <div className="w-90 md:w-2xl xl:w-7xl rounded-3xl mt-[5%] h-80 bg-(--prokress-beige-50) shadow-md">
            <div className="bg-(--prokress-beige-0) rounded-t-3xl pt-2 pl-4 pb-2"><p className="text-(--prokress-black-700) text-2xl font-bold">Jaetut projektit</p></div>
            <div className="flex flex-row gap-x-2 ml-4 mr-4 overflow-auto scrollbar">
               {sharedProjects.map((project, index) => {
                  return (
                     <div key={index}
                        id={project.projectId}
                        onContextMenu={(e) => {
                           e.preventDefault();
                           setContextMenuMode("project");
                           setContextMenuId(parseInt(e.currentTarget.id));
                           setPos({ x: e.pageX, y: e.pageY });
                        }}>
                        <ProjectCard project={project} index={index} />
                     </div>
                  )
               })}
               <div
                  onClick={() => { setProjectDialogOpen(true); }}
                  className="min-w-80 h-55 rounded-lg mt-4 m-2 bg-(--prokress-beige-0) text-(--prokress-black-700) shadow-md flex justify-center items-center">
                  <div className="text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500)"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg></div>
               </div>
            </div>
         </div>
         <ProjectDialogCreation
            isOpen={isProjectDialogOpen}
            toggleDialog={() => {setProjectDialogOpen(false), fetchProjects()}}
         />
         <ProjectEditDialog
            isOpen={isEditProjectDialogOpen}
            toggleDialog={closeEditProjectDialog}
            project={selectedProject}
            onSaved={fetchProjects}
         />
         {
            contextMenuMode && (
               <ContextMenu
                  isOpen={true}
                  mode={contextMenuMode}
                  toggleContextMenu={() => setContextMenuMode(null)}
                  contextMenuId={contextMenuId}
                  taskListId={0}
                  projectId={""}
                  positions={pos}
                  onEditProject={openEditProjectDialog}
                  onEditTask={() => { }} />
            )
         }
      </div >
   )
}

export default ProjectsPage
