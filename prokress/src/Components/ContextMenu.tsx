import { deleteProject, deleteTask } from "../helper/handler";

interface BaseContextMenu {
    isOpen: boolean;
    toggleContextMenu: () => void;
    positions: {x: number, y: number};
}

type ProjectMode = BaseContextMenu & {
    mode: "project";
    contextMenuId: number;
}

type TaskMode = BaseContextMenu & {
    mode: "task";
    projectId: string;
    taskListId: number;
    contextMenuId: number;
}

type ContextMenuProps = ProjectMode | TaskMode;

const ContextMenu: React.FC<ContextMenuProps> = (ContextMenuProps: ContextMenuProps) => {
    const deleteProjectById = (projectId: string) => {
        const token = localStorage.getItem("token");
        if (token && projectId) {
            if (confirm("Do you really want to delete!")) {
                deleteProject(token, projectId);
            }
        }
    }
    const deleteTaskById = (projectId: string, taskListId: number, taskId: number) => {
        const token = localStorage.getItem("token");
        if (token && projectId) {
            if (confirm("Do you really want to delete!")) {
                deleteTask(token, projectId, taskListId, taskId)
            }
        }
    }

    const isProject = ContextMenuProps.mode === "project";
    
    return (
        <div className="fixed z-999 grid h-screen w-screen transition-opacity duration-300" onClick={ContextMenuProps.toggleContextMenu} onContextMenu={ContextMenuProps.toggleContextMenu}>
            <div onClick={(e) => e.stopPropagation()} className="absolute w-40 h-20 rounded-md bg-(--prokress-beige-100) text-black" style={{ left: ContextMenuProps.positions.x + 'px', top: ContextMenuProps.positions.y - 90 + 'px' }}>
                {isProject && (
                    <div>
                        <ul>
                            <li onClick={() => { deleteProjectById(ContextMenuProps.contextMenuId.toString()) }} className="block px-4 py-2 rounded-md hover:bg-(--prokress-orange) text-black text-center" >Delete Project</li>

                            <li className="block px-4 py-2 rounded-md hover:bg-(--prokress-orange) text-black text-center" >Edit</li>
                        </ul>
                    </div>
                )}
                {!isProject && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <ul>
                            <li onClick={() => { deleteTaskById(ContextMenuProps.projectId, ContextMenuProps.taskListId, ContextMenuProps.contextMenuId) }} className="block px-4 py-2 rounded-md hover:bg-(--prokress-orange) text-black text-center" >Delete Task</li>
                            <li className="block px-4 py-2 rounded-md hover:bg-(--prokress-orange) text-black text-center" >Edit</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
export default ContextMenu
