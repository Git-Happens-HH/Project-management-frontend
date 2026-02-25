import ProjectCard from '../Components/ProjectCard.tsx'
import { useState } from 'react'
type projectType = {
   projectId: string;
   title: string,
   description: string,
   createdAt: string,
}
function ProjectsPage() {
   const [myProjects, setMyProjects] = useState<projectType[]>([{projectId:"1", title:"Project one", description:"This is first project you made", createdAt:"24/12/2024"}]);
   const [sharedProjects, setSharedProjects] = useState<projectType[]>([]);
   const curDate = new Intl.DateTimeFormat('en-GB').format(new Date());
   return (
      <div className="flex flex-col min-h-screen items-center bg-(--prokress-beige-100)">
         <div className="w-320 rounded-3xl mt-[5%] h-80 bg-(--prokress-beige-50) shadow-md">
            <div className="bg-(--prokress-beige-0) rounded-t-3xl pt-2 pl-4 pb-2"><p className="text-(--prokress-black-700) text-2xl font-bold">Omat projektit</p></div>
            <div className="flex flex-row gap-x-2 ml-4 mr-4 overflow-auto">
               { myProjects.map((project, index) => {
                  return (
                     <ProjectCard project={project} index={index} />
                  )
               }) }
               <div onClick={() => {setMyProjects([
                  ...myProjects, {projectId:"2", title:"New project", description:"This is new project", createdAt:curDate}
               ]);}} 
                  className="min-w-80 h-55 rounded-lg mt-4 m-2 bg-(--prokress-beige-0) text-(--prokress-black-700) shadow-md flex justify-center items-center">
                  <div className="text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500)"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg></div>
               </div>
            </div>
         </div>
         <div className="w-320 rounded-3xl mt-[5%] h-80 bg-(--prokress-beige-50) shadow-md">
            <div className="bg-(--prokress-beige-0) rounded-t-3xl pt-2 pl-4 pb-2"><p className="text-(--prokress-black-700) text-2xl font-bold">Jaetut projektit</p></div>
            <div className="flex flex-row gap-x-2 ml-4 mr-4 overflow-auto">
               { sharedProjects.map((project, index) => {
                  return (
                     <ProjectCard project={project} index={index}/>
                  )
               })}
               <div 
               onClick={() => {setSharedProjects([
                  ...sharedProjects, {projectId:"1", title:"New shared project", description:"New description", createdAt:curDate.toString()}
               ]);}} 
                  className="min-w-80 h-55 rounded-lg mt-4 m-2 bg-(--prokress-beige-0) text-(--prokress-black-700) shadow-md flex justify-center items-center">
                  <div className="text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500)"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg></div>
               </div>
            </div>
         </div>
      </div> 
   )
}

export default ProjectsPage
