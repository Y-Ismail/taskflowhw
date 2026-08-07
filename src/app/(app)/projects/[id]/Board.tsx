'use client';
import { useState } from 'react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { COLUMNS, TaskColumn } from '@/components/tasks/TaskColumn';
import { BoardSkeleton, EmptyState, ErrorPanel } from '@/components/ui';
import { useTasks } from '@/hooks/useTasks';
import { useUpdateTaskStatus } from '@/hooks/useUpdateTaskStatus';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import type { TaskStatus } from '@/types/database';
import { TodoPanel } from '@/components/ui';


/* ===========================================================================
 * TODO 3 — render the board
 *
 * A client component, because it needs hooks and click handlers.
 *
 * Imports you will need:
 *
 *   import { useState } from 'react';
 *   import { TaskCard } from '@/components/tasks/TaskCard';
 *   import { COLUMNS, TaskColumn } from '@/components/tasks/TaskColumn';
 *   import { BoardSkeleton, EmptyState, ErrorPanel } from '@/components/ui';
 *   import { useTasks } from '@/hooks/useTasks';
 *   import { useUpdateTaskStatus } from '@/hooks/useUpdateTaskStatus';
 *   import { useDeleteTask } from '@/hooks/useDeleteTask';
 *   import type { TaskStatus } from '@/types/database';
 *
 * ---------------------------------------------------------------------------
 * 1. Pull the data
 *
 *      const { data: tasks, isLoading, error, refetch } = useTasks(projectId);
 *
 * 2. THE UX TRIANGLE — four states, on every screen that touches a network:
 *
 *      isLoading   → <BoardSkeleton />
 *      error       → <ErrorPanel message={error.message} onRetry={() => refetch()} />
 *      no tasks    → <EmptyState … />
 *      otherwise   → the board
 *
 *    Juniors ship the success state and call it done. Then a user on slow
 *    wi-fi sees a blank white page and assumes the app is broken. The EMPTY
 *    state is the one everybody forgets: a brand-new board has no tasks, and
 *    if you do not say so, the user assumes it is a bug.
 *
 * 3. For each entry in COLUMNS, filter tasks by status and render a
 *    <TaskColumn> holding one <TaskCard> per task.
 *
 * 4. Drag and drop.
 *
 *      const [draggingId, setDraggingId] = useState<string | null>(null);
 *
 *    That is PURE UI STATE — it never goes near the server, so plain useState
 *    is exactly right. Client state and server state, side by side, each with
 *    the tool that fits.
 *
 *    On drop: bail out if nothing is being dragged or the task is already in
 *    that column (do not send a request for a no-op), otherwise
 *
 *      updateStatus.mutate({ id: draggingId, status });
 * =========================================================================== */

export function Board({ projectId }: { projectId: string }) {


  const {data: tasks,isLoading,error,refetch} = useTasks(projectId)
const updateStatus = useUpdateTaskStatus(projectId);
const removeTask = useDeleteTask(projectId)

const [draggingId, setDraggingId] = useState<string | null>(null)

if(isLoading){
  return <BoardSkeleton />
}

if(error){
  return <ErrorPanel message={error.message} onRetry={() => refetch()}/>
}

if(!tasks || tasks.length === 0){
  return <EmptyState title='No task yet'
  description='Add your first one with the form above'/>
}

function handleDrop(status: TaskStatus){
  if(!draggingId) return;

  const task = tasks?.find((candidate) => candidate.id === draggingId);
  setDraggingId(null)

  if(!task || task.status === status) return 

  updateStatus.mutate({id:draggingId, status})
}
  return (
    <div className='board' id="TODO 3">
      {COLUMNS.map(({status,label}) => {
        const columnTasks = tasks.filter((task) => task.status === status)

        return (
          <TaskColumn key={status} status={status} label={label} count={columnTasks.length} onDropTask={handleDrop}>
            {columnTasks.length === 0 && <p className='column__empty'>Drop a task here</p>}

            {columnTasks.map((task:any) => (
              <TaskCard key={task.id} task={task} isDragging={draggingId === task.id} isPending={removeTask.isPending && removeTask.variables === task.id}
                onMove={(next) => updateStatus.mutate({ id: task.id, status: next })}
                onDelete={() => removeTask.mutate(task.id)}
                onDragStart={() => setDraggingId(task.id)}
                onDragEnd={() => setDraggingId(null)}/>
            ))}
          </TaskColumn>
        )
      })}
      
    </div>
  );
}
