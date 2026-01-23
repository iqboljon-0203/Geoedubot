import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/FileUpload';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

// Form validation schema
const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['homework', 'internship']),
  deadline: z.date({
    required_error: 'Please select a deadline',
  }),
  maxScore: z.number().min(1).max(10),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const CreateTask = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const { userId } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      type: 'homework',
      maxScore: 10,
    },
  });

  const taskType = watch('type');

  const onSubmit = async (data: TaskFormData) => {
    if (!userId || !groupId) return;

    setIsSubmitting(true);
    try {
      let fileUrl = null;

      // Upload file if exists
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `tasks/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('task-files')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
      }

      // Create task
      const { error: taskError } = await supabase.from('tasks').insert({
        group_id: groupId,
        created_by: userId,
        title: data.title,
        description: data.description,
        type: data.type,
        deadline: data.deadline.toISOString(),
        file_url: fileUrl,
      });

      if (taskError) throw taskError;

      toast.success('Task created successfully!');
      navigate(`/teacher/groups/${groupId}`);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 sm:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Create Task</h1>
              <p className="text-sm text-zinc-600">
                Add a new assignment for your students
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Task Type Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <Label className="text-base font-semibold mb-4 block">
                Task Type
              </Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => field.onChange('homework')}
                      className={cn(
                        'relative p-6 rounded-2xl border-2 transition-all',
                        field.value === 'homework'
                          ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50'
                          : 'border-zinc-200 hover:border-zinc-300'
                      )}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center',
                            field.value === 'homework'
                              ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                              : 'bg-zinc-100'
                          )}
                        >
                          <FileText
                            className={cn(
                              'w-6 h-6',
                              field.value === 'homework'
                                ? 'text-white'
                                : 'text-zinc-600'
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            'font-semibold',
                            field.value === 'homework'
                              ? 'text-blue-900'
                              : 'text-zinc-700'
                          )}
                        >
                          Homework
                        </span>
                      </div>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => field.onChange('internship')}
                      className={cn(
                        'relative p-6 rounded-2xl border-2 transition-all',
                        field.value === 'internship'
                          ? 'border-green-600 bg-gradient-to-br from-green-50 to-emerald-50'
                          : 'border-zinc-200 hover:border-zinc-300'
                      )}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center',
                            field.value === 'internship'
                              ? 'bg-gradient-to-br from-green-600 to-emerald-600'
                              : 'bg-zinc-100'
                          )}
                        >
                          <span className="text-2xl">
                            {field.value === 'internship' ? '✏️' : '📝'}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'font-semibold',
                            field.value === 'internship'
                              ? 'text-green-900'
                              : 'text-zinc-700'
                          )}
                        >
                          Internship
                        </span>
                      </div>
                    </motion.button>
                  </div>
                )}
              />
            </Card>
          </motion.div>

          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Basic Information
              </h2>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Chapter 5 Exercises"
                  {...register('title')}
                  className={cn(
                    'rounded-xl',
                    errors.title && 'border-red-500'
                  )}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed instructions for the task..."
                  rows={4}
                  {...register('description')}
                  className={cn(
                    'rounded-xl resize-none',
                    errors.description && 'border-red-500'
                  )}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Max Score */}
              <div className="space-y-2">
                <Label htmlFor="maxScore">Maximum Score (1-10)</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min={1}
                  max={10}
                  {...register('maxScore', { valueAsNumber: true })}
                  className={cn(
                    'rounded-xl',
                    errors.maxScore && 'border-red-500'
                  )}
                />
                {errors.maxScore && (
                  <p className="text-sm text-red-600">
                    {errors.maxScore.message}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Deadline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900">Deadline</h2>
              <Controller
                name="deadline"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal rounded-xl h-12',
                          !field.value && 'text-zinc-500',
                          errors.deadline && 'border-red-500'
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.deadline && (
                <p className="text-sm text-red-600">{errors.deadline.message}</p>
              )}
            </Card>
          </motion.div>

          {/* File Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Attachment (Optional)
              </h2>
              <FileUpload file={file} onFileSelect={setFile} />
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="sticky bottom-4 sm:relative sm:bottom-0"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Create Task
                </div>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
