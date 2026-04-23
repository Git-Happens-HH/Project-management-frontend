import ProjectCard from '../Components/ProjectCard.tsx'
import ProjectDialogCreation from '../Components/ProjectDialogCreation'
import { useState, useEffect } from 'react'
import { getProjectsForUser } from '../helper/handler.tsx'
import type { projectType } from '../helper/types.ts'
import ContextMenu from '../Components/ContextMenu.tsx'

function ProjectsPage() {
    const [contextMenuMode, setContextMenuMode] = useState<"project" | "task" | null>(null);
    const [contextMenuId, setContextMenuId] = useState<number>();
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [myProjects, setMyProjects] = useState<projectType[]>([]);
    const [sharedProjects, setSharedProjects] = useState<projectType[]>([]);
    const [isProjectDialogOpen, setProjectDialogOpen] = useState(false)
    const [creatingShared, setCreatingShared] = useState(false)
    //const curDate = new Intl.DateTimeFormat('en-GB').format(new Date());
    const appUserId = localStorage.getItem('token')

    useEffect(() => {
        const fetchProjects = async (): Promise<void> => {
            try {
                const response: projectType[] = await getProjectsForUser(appUserId);
                const tempSharedProjects: projectType[] = [];
                const tempMyProjects: projectType[] = [];
                for (const project of response) {
                    if (project.isShared) {
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
        fetchProjects();
    }, [])

    return (
        <div className="flex flex-col min-h-screen items-center bg-(--prokress-beige-100)">
            <div className="w-90 md:w-2xl xl:w-7xl rounded-3xl mt-[5%] h-80 bg-(--prokress-beige-50) shadow-md">
                <div className="bg-(--prokress-beige-0) rounded-t-3xl pt-2 pl-4 pb-2"><p className="text-(--prokress-black-700) text-2xl font-bold">Omat projektit</p></div>
                <div className="flex flex-row gap-x-2 ml-4 mr-4 overflow-auto">
                    {myProjects.map((project, index) => {
                        return (
                            <div key={index}
                                id={project.projectId}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setContextMenuMode("project");
                                    setContextMenuId(e.currentTarget.id);
                                    setPos({ x: e.pageX, y: e.pageY });
                                }}>
                                <ProjectCard project={project} index={index} />
                            </div>
                        )
                    })}
                    <div onClick={() => { setCreatingShared(false); setProjectDialogOpen(true); }}
                        className="min-w-80 h-55 rounded-lg mt-4 m-2 bg-(--prokress-beige-0) text-(--prokress-black-700) shadow-md flex justify-center items-center">
                        <div className="text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500)"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg></div>
                    </div>
                </div>
            </div>
            <div className="w-90 md:w-2xl xl:w-7xl rounded-3xl mt-[5%] h-80 bg-(--prokress-beige-50) shadow-md">
                <div className="bg-(--prokress-beige-0) rounded-t-3xl pt-2 pl-4 pb-2"><p className="text-(--prokress-black-700) text-2xl font-bold">Jaetut projektit</p></div>
                <div className="flex flex-row gap-x-2 ml-4 mr-4 overflow-auto">
                    {sharedProjects.map((project, index) => {
                        return (
                            <div key={index}
                                id={project.projectId}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setContextMenuMode("project");
                                    setContextMenuId(e.currentTarget.id);
                                    setPos({ x: e.pageX, y: e.pageY });
                                }}>
                                <ProjectCard project={project} index={index} />
                            </div>
                        )
                    })}
                <div
                    onClick={() => { setCreatingShared(true); setProjectDialogOpen(true); }}
                    className="min-w-80 h-55 rounded-lg mt-4 m-2 bg-(--prokress-beige-0) text-(--prokress-black-700) shadow-md flex justify-center items-center">
                    <div className="text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500)"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg></div>
                </div>
            </div>
        </div>
            {/* Project creation dialog */ }
    <ProjectDialogCreation
        isOpen={isProjectDialogOpen}
        toggleDialog={() => setProjectDialogOpen(false)}
        /*onCreate={(payload) => {
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
        }}*/
        is_shared={creatingShared}
    />
    {
        contextMenuMode && (
            <ContextMenu
                isOpen={true}
                mode={contextMenuMode}
                toggleContextMenu={() => setContextMenuMode(null)}
                contextMenuId={contextMenuId}
                positions={pos} />
        )
    }
        </div >
    )
}

export default ProjectsPage
