import { useDroppable } from '@dnd-kit/core'
import '../App.css'
import React from 'react';

type Props = {
   firstChild?: React.ReactNode,
   secondChild?: React.ReactNode,
   children?: React.ReactNode,
   id: string | number,
   taskListTitle: string,
   taskCount: number,
   isDropTarget?: boolean,
}

function TaskList({ firstChild, secondChild, children, id, taskListTitle, taskCount, isDropTarget }: Props) {
   const numericListId = typeof id === 'number'
      ? id
      : Number(String(id).match(/^(?:task|list)-(\d+)$/)?.[1] ?? id);

   const { setNodeRef, isOver } = useDroppable({
      id,
      data: { type: 'list', listId: numericListId, index: taskCount },
   });
   const style = isDropTarget || isOver ? { background: '#00000030' } : undefined;
   const childrenArray = React.Children.toArray(children);
   const first = firstChild || childrenArray[0];
   const second = secondChild || childrenArray[1];
   return (
      <div
         className="border-solid rounded-xl min-w-87.5 h-[75vh] p-2 bg-(--prokress-beige-0) shadow flex flex-col"
      >
         <h1 className="text-(--prokress-black-700) text-lg font-bold">{taskListTitle}</h1>
         <div ref={setNodeRef} style={style} className="flex-1 min-h-32 overflow-y-auto overflow-x-hidden scrollbar justify-between">
            {first}
            {second}
         </div>
      </div>
   )
}

export default TaskList
