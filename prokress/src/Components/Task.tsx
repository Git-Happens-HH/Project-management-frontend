import {useState} from 'react'
import {useSortable} from '@dnd-kit/react/sortable'

interface TaskProps {
  id: string;
  index: any;
  column: string;
}

function Task({ id, index, column }: TaskProps) {
   const [isCollapsed, setIsCollapsed] = useState(parseInt(index) >= 4);
   const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed);
   };
   const { ref, isDragging } = useSortable({ id, index, type: 'item', accept: 'item', group: column });
   return (
      <div ref={ ref } data-dragging={isDragging} className={`flex flex-col rounded w-[330px] border-solid border-black border-2 text-(--prokress-black-700) my-2 bg-(--prokress-beige-0) transition-all duration-300 ease-in-out ${isCollapsed ? 'h-10 overflow-hidden p-2' : 'h-32 p-2'}`} id={index}>
         <div className='flex pb-1'>
            <p className="w-9/10 text-md">{id}</p>
            <button className="rounded-full w-0.8/10 hover:bg-gray-100 p-0.2" onClick={toggleCollapse}>
            {isCollapsed ? 
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00000"><path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z"/></svg> : 
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00000"><path d="M440-440v240h-80v-160H200v-80h240Zm160-320v160h160v80H520v-240h80Z"/></svg>}
            </button>
         </div>
         <div className={`border-t-1 pt-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'hidden' : 'block'}`}><p>Description here</p></div>
      </div>
   )
}

export default Task
