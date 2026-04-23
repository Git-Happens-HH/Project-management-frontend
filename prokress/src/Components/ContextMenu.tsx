import { deleteProject } from "../helper/handler";

interface ContextMenuProps {
    isOpen: boolean;
    toggleContextMenu: () => void;
    mode: "project" | "task";
    contextMenuId: number;
    positions: object;
}
const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, toggleContextMenu, mode, contextMenuId, positions }) => {
    if (!isOpen) return null;
    const deleteProjectById = (projectId: string) => {
        const token = localStorage.getItem("token");
        if (token && projectId) {
            if (confirm("Do you really want to delete!")) {
                deleteProject(token, projectId);
            }
        }
    }
    const isProject = mode === "project";
    return (
        <div className="fixed z-999 grid h-screen w-screen transition-opacity duration-300" onClick={toggleContextMenu} onContextMenu={toggleContextMenu}>
            <div onClick={(e) => e.stopPropagation()} className="absolute w-40 h-20 rounded-md bg-(--prokress-beige-100) text-black" style={{ left: positions.x + 'px', top: positions.y - 90 + 'px' }}>
                {isProject && (
                    <div>
                        <ul>
                            <li onClick={() => { deleteProjectById(contextMenuId.toString())}} className="block px-4 py-2 rounded-md hover:bg-(--prokress-orange) text-black text-center" >Delete Project</li>

                            <li className="block px-4 py-2 rounded-md hover:bg-(--prokress-orange) text-black text-center" >Edit</li>
                        </ul>
                    </div>
                )}
                {!isProject && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <ul>
                            <li onClick={() => { alert("something") }}>Delete Task</li>
                            <li>Edit</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
export default ContextMenu
