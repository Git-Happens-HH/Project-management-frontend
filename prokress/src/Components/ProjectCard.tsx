type projectType = {
   projectId: number;
   title: string,
   description: string,
   createdAt: string,
}

function ProjectCard({project, index}) {
   return (
      <div index={index} class="min-w-80 h-55 rounded-lg mt-4 m-2 p-2 bg-(--prokress-beige-0) text-(--prokress-black-700) shadow-md grid content-between gap-4">
         <p class="text-2xl">{project.title}</p>
         <div>
            <p>{project.description}</p>
            <p>{project.createdAt}</p>
         </div>
      </div>
   )
}
export default ProjectCard
