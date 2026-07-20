type Props = {
    children: React.ReactNode
    id: number
    taskListTitle: string
    isDropTarget?: boolean
    onDragOver?: React.DragEventHandler<HTMLDivElement>
    onDropTask?: (targetListId: number) => void | Promise<void>
}

function TaskList ({children, id, taskListTitle, isDropTarget, onDragOver, onDropTask}: Props) {
   const style = isDropTarget ? {background: '#00000030'} : undefined;

   return (
      <div
         onDragOver={onDragOver}
         onDrop={(event) => {
            event.preventDefault();
            onDropTask?.(id);
         }}
         style={style}
         className="border-solid rounded-xl min-w-87.5 h-[75vh] p-2 bg-(--prokress-beige-0) shadow overflow-auto"
      >
         <h1 className="text-(--prokress-black-700) text-lg font-bold">{taskListTitle}</h1>
         {children}
      </div>
   )
}

export default TaskList
