import { deleteProject, deleteTask } from "../helper/handler";

interface BaseContextMenu {
  isOpen: boolean;
  toggleContextMenu: () => void;
  positions: { x: number; y: number };
}

type ProjectMode = BaseContextMenu & {
  mode: "project";
  contextMenuId: number;
  onEditProject?: () => void;
};

type TaskMode = BaseContextMenu & {
  mode: "task";
  projectId: string;
  taskListId: number;
  contextMenuId: number;
  onEditTask: (taskId: number, taskListId: number) => void;
};

type ContextMenuProps = ProjectMode | TaskMode;

const ContextMenu: React.FC<ContextMenuProps> = (props: ContextMenuProps) => {
  const deleteProjectById = (projectId: string) => {
    const token = localStorage.getItem("token");
    if (token && projectId) {
      if (confirm("Do you want to delete this project?")) {
        deleteProject(token, projectId);
      }
    }
  };
  const deleteTaskById = (
    projectId: string,
    taskListId: number,
    taskId: number,
  ) => {
    const token = localStorage.getItem("token");
    if (token && projectId) {
      if (confirm("Do you want to delete this task?")) {
        deleteTask(token, projectId, taskListId, taskId);
      }
    }
  };

  //   const activateEditTaskDialog = ({
  //     projectId: string,
  //     taskListId: number,
  //     taskId: number,
  //   }) => {
  //     const token = localStorage.getItem("token");
  //   };

  const isProject = props.mode === "project";

  return (
    <div
      className="fixed z-999 grid h-screen w-screen"
      onClick={props.toggleContextMenu}
      onContextMenu={props.toggleContextMenu}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute w-40 h-20 rounded-md bg-(--prokress-beige-100)"
        style={{ left: props.positions.x, top: props.positions.y -90 }}
      >
        {isProject && (
          <ul>
            <li
              onClick={(e) => {
                e.stopPropagation();
                deleteProjectById(props.contextMenuId.toString());
              }}
              className="px-4 py-2 hover:bg-(--prokress-orange) text-center text-black"
            >
              Delete Project
            </li>

            <li
              onClick={(e) => {
                e.stopPropagation();
                props.onEditProject?.();
              }}
              className="px-4 py-2 hover:bg-(--prokress-orange) text-center text-black"
            >
              Edit
            </li>
          </ul>
        )}

        {!isProject && (
          <ul>
            <li
              onClick={() =>
                deleteTaskById(
                  props.projectId,
                  props.taskListId,
                  props.contextMenuId,
                )
              }
              className="px-4 py-2 hover:bg-(--prokress-orange) text-center text-black"
            >
              Delete Task
            </li>

            <li
              // contextMenuId == taskID
              onClick={() => props.onEditTask(props.contextMenuId, props.taskListId)}
              className="px-4 py-2 hover:bg-(--prokress-orange) text-center text-black"
            >
              Edit
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default ContextMenu;
