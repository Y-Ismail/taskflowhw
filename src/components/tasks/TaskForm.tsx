'use client';

import { TodoPanel } from '@/components/ui'
 import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
    import { Button, Field, Input, Select, Textarea } from '@/components/ui';
    import { useCreateTask } from '@/hooks/useCreateTask';
   import { createTaskSchema, type CreateTaskInput } from '@/lib/validation/task';
   import { TASK_PRIORITIES } from '@/types/database';

/* ===========================================================================
 * TODO 5 — the new-task form, with React Hook Form + Zod
 *
 * Open `src/app/login/LoginForm.tsx` first. Two fields, five useStates, manual
 * loading and error tracking. Now imagine twelve fields.
 *
 * This form has four fields, full validation, accessible error messages and a
 * disabled-while-saving button — and it will end up SHORTER than that one.
 *
 * Imports you will need:
 *
 *   import { useForm } from 'react-hook-form';
 *   import { zodResolver } from '@hookform/resolvers/zod';
 *   import { Button, Field, Input, Select, Textarea } from '@/components/ui';
 *   import { useCreateTask } from '@/hooks/useCreateTask';
 *   import { createTaskSchema, type CreateTaskInput } from '@/lib/validation/task';
 *   import { TASK_PRIORITIES } from '@/types/database';
 *
 * ---------------------------------------------------------------------------
 * 1. Set up the form
 *
 *      const {
 *        register, handleSubmit, reset, setError,
 *        formState: { errors, isSubmitting },
 *      } = useForm<CreateTaskInput>({
 *        resolver: zodResolver(createTaskSchema),
 *        defaultValues: { title: '', description: '', status: 'todo', priority: 'medium' },
 *      });
 *
 *    `zodResolver` is the BRIDGE. React Hook Form knows nothing about Zod;
 *    Zod knows nothing about React. The resolver is the adapter between them,
 *    which is why you could swap Zod for Yup without touching this file.
 *
 *    ALWAYS set defaultValues. Leave them out and the inputs start undefined,
 *    React calls them uncontrolled, and you get the yellow console warning the
 *    first time somebody types.
 *
 * 2. Register each field
 *
 *      <Input id="title" {...register('title')} />
 *
 *    That spread is FOUR things at once: name, onChange, onBlur and a ref.
 *    RHF keeps the value in the ref, not in state — so typing here re-renders
 *    NOTHING. Day 1's counter re-rendered on every keystroke; a twenty-field
 *    form doing that on a cheap Android phone is why forms feel laggy.
 *
 * 3. Show the errors, accessibly
 *
 *      <Field label="Title" htmlFor="title" error={errors.title?.message}>
 *      … and on the input:
 *        aria-invalid={Boolean(errors.title)}
 *        aria-describedby={errors.title ? 'title-error' : undefined}
 *
 *    A sighted user sees red. A screen-reader user hears nothing at all
 *    unless you wire this up. Three attributes: the difference between a demo
 *    and a product.
 *
 * 4. Submit
 *
 *      const createTask = useCreateTask(projectId, userId);
 *
 *      async function onSubmit(values: CreateTaskInput) {
 *        try {
 *          await createTask.mutateAsync(values);   // mutateAsync, not mutate:
 *          reset();                                // it returns a promise, so
 *        } catch (error) {                         // `await` works and
 *          setError('root', { … });                // isSubmitting stays true
 *        }                                         // until the server answers
 *      }
 *
 *      <form onSubmit={handleSubmit(onSubmit)} noValidate>
 *
 *    `noValidate` silences the browser's own validation bubbles so Zod is the
 *    only voice in the room.
 *
 *    Disable the button with `isSubmitting`. Without it, an impatient user on
 *    slow wi-fi double-clicks and creates the task twice.
 * =========================================================================== */

export function TaskForm({ projectId, userId }: { projectId: string; userId: string }) {
   const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskInput>({
     resolver: zodResolver(createTaskSchema),
      defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
    },
  })


   const createTask = useCreateTask(projectId, userId);

  async function onSubmit(values: CreateTaskInput) {
    try {
       await createTask.mutateAsync(values);
      reset();
    } catch (error) {
   setError('root', {
        message: error instanceof Error ? error.message : 'Could not save the task.',
      });
    }
  }
  
  return (
    <form className='form card' onSubmit={handleSubmit(onSubmit)} noValidate id="TODO 5">
      {/* Build the new-task form here (project <code>{projectId}</code>, user{' '}
      <code>{userId.slice(0, 8)}…</code>). Start with <code>useForm</code> +{' '}
      <code>zodResolver</code>. */}
      <Field  label="Title" htmlFor="title" error={errors.title?.message}>
       <Input
          id="title"
          placeholder="What needs doing?"{...register('title')}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
      </Field>
      <Field
        label="Description"
        htmlFor="description"
        hint="Optional."
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          rows={2}
          placeholder="Any detail worth remembering…"
          {...register('description')}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
      </Field>

       <div className="form__row">
        <Field label="Priority" htmlFor="priority" error={errors.priority?.message}>
          <Select id="priority" {...register('priority')}>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Column" htmlFor="status" error={errors.status?.message}>
          <Select id="status" {...register('status')}>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </Select>
        </Field>
      </div>

      {errors.root && (
        <p className="field__error" role="alert">
          {errors.root.message}
        </p>
      )}
      
       <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Add task'}
      </Button>
    </form>
  );
}
