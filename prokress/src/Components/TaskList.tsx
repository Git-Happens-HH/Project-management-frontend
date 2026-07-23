import { useDroppable } from '@dnd-kit/core'

type Props = {
    children: React.ReactNode
    id: string | number
    taskListTitle: string
   taskCount: number
    isDropTarget?: boolean
}

function TaskList ({children, id, taskListTitle, taskCount, isDropTarget}: Props) {
   const numericListId = typeof id === 'number'
      ? id
      : Number(String(id).match(/^(?:task|list)-(\d+)$/)?.[1] ?? id);

   const { setNodeRef, isOver } = useDroppable({
      id,
      data: { type: 'list', listId: numericListId, index: taskCount },
   });
   const style = isDropTarget || isOver ? { background: '#00000030' } : undefined;

   return (
      <div
         className="border-solid rounded-xl min-w-87.5 h-[75vh] p-2 bg-(--prokress-beige-0) shadow overflow-auto relative flex flex-col"
      >
         <h1 className="text-(--prokress-black-700) text-lg font-bold">{taskListTitle}</h1>
         <div ref={setNodeRef} style={style} className="flex-1 min-h-32">
            {children}
         </div>
      </div>
   )
}

export default TaskList
