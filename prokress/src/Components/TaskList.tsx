import {useDroppable} from '@dnd-kit/react';
import {CollisionPriority} from '@dnd-kit/abstract';

type Props = {
    children: React.ReactNode
    id: number
    taskListTitle: string
}

function TaskList ({children, id, taskListTitle}: Props) {
   const {isDropTarget, ref} = useDroppable({
    id,
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
   });
   const style = isDropTarget ? {background: '#00000030'} : undefined;

   return (
      <div ref={ref} style={style} className="border-solid rounded-xl min-w-87.5 h-[75vh] p-2 bg-(--prokress-beige-0) shadow overflow-auto"> 
         <h1 className="text-(--prokress-black-700) text-lg font-bold">{taskListTitle}</h1>
         {children}
      </div>
   )
}

export default TaskList
