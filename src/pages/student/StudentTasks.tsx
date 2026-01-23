import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useStudentTasks } from '@/hooks/useStudentTasks';
import { formatDistanceToNow, isPast } from 'date-fns';

export default function StudentTasks() {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');
  
  const { data: tasks = [], isLoading } = useStudentTasks(userId);

  // Filter tasks based on tab
  const filteredTasks = tasks.filter((task) => {
    const hasSubmitted = task.answers && task.answers.length > 0;
    return activeTab === 'todo' ? !hasSubmitted : hasSubmitted;
  });

  const getTaskStatus = (task: any) => {
    if (isPast(new Date(task.deadline)) && (!task.answers || task.answers.length === 0)) return 'overdue';
    if (task.answers && task.answers.length > 0) return 'completed';
    return 'pending';
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    if (isPast(date)) {
      return `Overdue by ${formatDistanceToNow(date)}`;
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const getIcon = (type: string) => (type === 'internship' ? '💼' : '📝');
  const getColor = (type: string) => (type === 'internship' ? 'from-purple-600 to-blue-600' : 'from-green-600 to-emerald-600');

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-zinc-900"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('todo')}
            className={cn(
              'flex-1 py-3 rounded-2xl font-semibold transition-all',
              activeTab === 'todo'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            )}
          >
            To Do
          </button>
          <button
            onClick={() => setActiveTab('done')}
            className={cn(
              'flex-1 py-3 rounded-2xl font-semibold transition-all',
              activeTab === 'done'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            )}
          >
            Done
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
             <div className="text-center py-12">
               <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
             </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={activeTab === 'todo' ? Filter : CheckCircle2}
              title={activeTab === 'todo' ? 'No pending tasks' : 'No completed tasks'}
              description={
                activeTab === 'todo'
                  ? "You're all caught up! Check back later for new assignments."
                  : "You haven't completed any tasks yet. Keep going!"
              }
            />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredTasks.map((task, index) => {
                const status = getTaskStatus(task);
                const hasSubmitted = task.answers && task.answers.length > 0;
                const score = hasSubmitted ? task.answers?.[0].score : null;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      onClick={() =>
                        navigate(`/student-dashboard/tasks/${task.id}`)
                      }
                      className="bg-zinc-900 border-zinc-800 p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getColor(task.type)} flex items-center justify-center flex-shrink-0`}
                        >
                          <span className="text-2xl">{getIcon(task.type)}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-white truncate pr-2">
                              {task.title}
                            </h3>
                            {status === 'overdue' && (
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-500 whitespace-nowrap">
                                OVERDUE
                              </span>
                            )}
                            {score !== null && score !== undefined && (
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-600/20 text-green-500 whitespace-nowrap">
                                Score: {score}/10
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-400 mb-3 truncate">
                            {task.type.charAt(0).toUpperCase() + task.type.slice(1)} • {task.groups?.name}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              {hasSubmitted ? (
                                <span className="text-zinc-500">
                                  Submitted {task.answers && task.answers[0] ? new Date(task.answers[0].created_at).toLocaleDateString() : ''}
                                </span>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4 text-zinc-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span
                                    className={cn(
                                      status === 'overdue'
                                        ? 'text-red-500'
                                        : 'text-zinc-500'
                                    )}
                                  >
                                    {formatDeadline(task.deadline)}
                                  </span>
                                </>
                              )}
                            </div>
                            {!hasSubmitted && (
                              <Button
                                size="sm"
                                className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl h-8 px-4"
                              >
                                Submit
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
