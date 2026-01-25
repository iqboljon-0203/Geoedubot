import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Save, Loader2 } from 'lucide-react';
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
import { useTranslation } from 'react-i18next';

export const CreateTask = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const { userId } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation schema inside component to use 't'
  const taskSchema = z.object({
    title: z.string().min(3, t('tasks.create.validation.title_min')),
    description: z.string().min(10, t('tasks.create.validation.desc_min')),
    type: z.enum(['homework', 'internship']),
    deadline: z.date({
      required_error: t('tasks.create.validation.deadline_required'),
    }),
    maxScore: z.number().min(1).max(10),
  });

  type TaskFormData = z.infer<typeof taskSchema>;

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

      toast.success(t('tasks.create.success'));
      navigate(`/teacher/groups/${groupId}`);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(t('tasks.create.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-0">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('tasks.create.title')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('tasks.create.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </header>

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
              <Label className="text-base font-semibold mb-4 block text-foreground">
                {t('tasks.create.type')}
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
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground/30'
                      )}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center',
                            field.value === 'homework'
                              ? 'bg-primary'
                              : 'bg-muted'
                          )}
                        >
                          <FileText
                            className={cn(
                              'w-6 h-6',
                              field.value === 'homework'
                                ? 'text-primary-foreground'
                                : 'text-muted-foreground'
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            'font-semibold',
                            field.value === 'homework'
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          )}
                        >
                          {t('tasks.create.homework')}
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
                          ? 'border-green-600 bg-green-500/5'
                          : 'border-border hover:border-muted-foreground/30'
                      )}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center',
                            field.value === 'internship'
                              ? 'bg-green-600'
                              : 'bg-muted'
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
                              ? 'text-green-600'
                              : 'text-muted-foreground'
                          )}
                        >
                          {t('tasks.create.internship')}
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
              <h2 className="text-lg font-semibold text-foreground">
                {t('tasks.create.basic_info')}
              </h2>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">{t('tasks.create.task_title')}</Label>
                <Input
                  id="title"
                  placeholder={t('tasks.create.title_placeholder')}
                  {...register('title')}
                  className={cn(
                    'rounded-xl bg-background text-foreground border-border',
                    errors.title && 'border-red-500'
                  )}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">{t('tasks.create.description')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('tasks.create.description_placeholder')}
                  rows={4}
                  {...register('description')}
                  className={cn(
                    'rounded-xl resize-none bg-background text-foreground border-border',
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
                <Label htmlFor="maxScore" className="text-foreground">{t('tasks.create.max_score')}</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min={1}
                  max={10}
                  {...register('maxScore', { valueAsNumber: true })}
                  className={cn(
                    'rounded-xl bg-background text-foreground border-border',
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
              <h2 className="text-lg font-semibold text-foreground">{t('tasks.create.deadline')}</h2>
              <Controller
                name="deadline"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal rounded-xl h-12 bg-background border-border',
                          !field.value && 'text-muted-foreground',
                          errors.deadline && 'border-red-500'
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>{t('tasks.create.pick_date')}</span>
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
              <h2 className="text-lg font-semibold text-foreground">
                {t('tasks.create.attachment')}
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
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold text-lg shadow-lg border-0"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('tasks.create.creating')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  {t('tasks.create.create_btn')}
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
