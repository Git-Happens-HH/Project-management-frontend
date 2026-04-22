import ProjectCard from '../Components/ProjectCard.tsx'
import ProjectDialogCreation from '../Components/ProjectDialogCreation'
import { useState, useEffect } from 'react'
import { getProjectsForUser } from '../helper/handler.tsx'
import type { projectType } from '../helper/types.ts'

function ProjectsPage() {
   const [myProjects, setMyProjects] = useState<projectType[]>([{projectId:"1", title:"Project one", description:"This is first project you made", createdAt:"24/12/2024", isShared: false}]);
   const [sharedProjects, setSharedProjects] = useState<projectType[]>([]);
   const [isProjectDialogOpen, setProjectDialogOpen] = useState(false)
   const [creatingShared, setCreatingShared] = useState(false)
   const curDate = new Intl.DateTimeFormat('en-GB').format(new Date());
   const appUserId = localStorage.getItem('token')

   useEffect(() =>{
      const fetchProjects = async (): Promise<void> => {
         try {
            const response: projectType[] = await getProjectsForUser(appUserId);
            for (const project of response) {
               if (project.isShared) {
                  setSharedProjects([...sharedProjects, project])
               } else (
                  setMyProjects([...myProjects, project])
               )
            }
         } catch (err: unknown) {
             if (err instanceof Error) {
                console.error(err.message)
             } else {
                 console.error("Unknown error", err)
             }
         }
      };
      fetchProjects();
   }, [])

   return (
      <div className="flex flex-col min-h-screen items-center bg-(--prokress-beige-100)">
         <div className="w-7xl rounded-3xl mt-[5%] h-80 bg-(--prokress-beige-50) shadow-md">
            <div className="bg-(--prokress-beige-0) rounded-t-3xl pt-2 pl-4 pb-2"><p className="text-(--prokress-black-700) text-2xl font-bold">Omat projektit</p></div>
            <div className="flex flex-row gap-x-2 ml-4 mr-4 overflow-auto">
               { myProjects.map((project, index) => {
                  return (
                     <ProjectCard project={project} index={index} />
                  )
               }) }
               <div onClick={() => { setCreatingShared(false); setProjectDialogOpen(true); }}
                  className="min-w-80 h-55 rounded-lg mt-4 m-2 bg-(--prokress-beige-0) text-(--prokress-black-700) shadow-md flex justify-center items-center">
                  <div className="text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500)"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg></div>
               </div>
            </div>
         </div>
         <div className="w-7xl rounded-3xl mt-[5%] h-80 bg-(--prokress-beige-50) shadow-md">
            <div className="bg-(--prokress-beige-0) rounded-t-3xl pt-2 pl-4 pb-2"><p className="text-(--prokress-black-700) text-2xl font-bold">Jaetut projektit</p></div>
            <div className="flex flex-row gap-x-2 ml-4 mr-4 overflow-auto">
                      { sharedProjects.map((project, index) => {
                  return (
                     <ProjectCard project={project} index={index}/>
                  )
               })}
                      <div
                      onClick={() => { setCreatingShared(true); setProjectDialogOpen(true); }}
                  className="min-w-80 h-55 rounded-lg mt-4 m-2 bg-(--prokress-beige-0) text-(--prokress-black-700) shadow-md flex justify-center items-center">
                  <div className="text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500)"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg></div>
               </div>
            </div>
         </div>
             {/* Project creation dialog */}
             <ProjectDialogCreation
                isOpen={isProjectDialogOpen}
                toggleDialog={() => setProjectDialogOpen(false)}
                onCreate={(payload) => {
                   const newProject: projectType = {
                      projectId: Date.now().toString(),
                      title: payload.name,
                      description: payload.description ?? '',
                      createdAt: curDate,
                      isShared: creatingShared
                   }
                   if (creatingShared) {
                      setSharedProjects(prev => [...prev, newProject])
                   } else {
                      setMyProjects(prev => [...prev, newProject])
                   }
                }}
             />
      </div>
   )
}

export default ProjectsPage
