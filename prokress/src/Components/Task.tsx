import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TaskProps {
  id: string;
  taskId: number;
  listId: number;
  index: number;
  column: number;
  title: string;
  description: string;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
}

function Task({ index, title, description, onContextMenu, id, taskId, listId }: TaskProps) {
   const [isCollapsed, setIsCollapsed] = useState(index >= 4);
   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
      data: { type: 'task', taskId, listId, index },
   });

   const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed);
   };

   const style = {
      position: 'relative' as const,
      transform: transform ? CSS.Translate.toString(transform) : undefined,
      transition: transition ?? 'transform 150ms ease',
      opacity: isDragging ? 0.95 : 1,
      cursor: 'grab',
      touchAction: 'none' as const,
      zIndex: isDragging ? 1000 : 1,
      boxShadow: isDragging ? '0 10px 24px rgba(0, 0, 0, 0.2)' : undefined,
      scale: isDragging ? '1.01' : undefined,
   };

   return (
      <div
         ref={setNodeRef}
         {...attributes}
         {...listeners}
         style={style}
         onContextMenu={onContextMenu}
         className={`flex flex-col rounded w-[330px] border-solid border-black border-2 text-(--prokress-black-700) my-2 bg-(--prokress-beige-0) transition-all duration-300 ease-in-out ${
            isDragging ? "min-h-32 h-auto overflow-visible p-2" : isCollapsed ? "h-10 overflow-hidden p-2" : "h-32 p-2"
         } ${isDragging ? "opacity-60" : "opacity-100"}`}
      >
         <div className='flex pb-1'>
            <p className="w-9/10 text-md">{title}</p>
            <button
               className="rounded-full w-0.8/10 hover:bg-gray-100 p-0.2"
               onClick={toggleCollapse}
               onPointerDown={(event) => event.stopPropagation()}
            >
            {isCollapsed ?
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00000"><path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z"/></svg> : 
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00000"><path d="M440-440v240h-80v-160H200v-80h240Zm160-320v160h160v80H520v-240h80Z"/></svg>}
            </button>
         </div>
         <div className={`border-t pt-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'hidden' : 'block'}`}><p>{description}</p></div>
      </div>
   )
}

export default Task
