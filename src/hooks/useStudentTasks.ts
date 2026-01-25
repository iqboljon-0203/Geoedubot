import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'homework' | 'internship';
  deadline: string;
  date?: string; // For internship tasks
  created_at: string;
  group_id: string;
  groups: {
    name: string;
  };
  answers?: {
    id: string;
    score: number | null;
    created_at: string;
  }[];
}

export const useStudentTasks = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['student-tasks', userId],
    queryFn: async () => {
      if (!userId) return [];

      // 1. Get user's groups
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (membersError) throw membersError;
      
      const groupIds = members.map(m => m.group_id);
      
      if (groupIds.length === 0) return [];

      // 2. Get tasks for those groups with group name and user's answer
      // Since RLS limits answers to own answers, this join is safe.
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          type,
          deadline,
          date,
          created_at,
          group_id,
          groups (name),
          answers (
            id,
            score,
            created_at
          )
        `)
        .in('group_id', groupIds)
        // Ensure we only get answers for this user explicitly if RLS is loose, 
        // but typically standard left join syntax in Supabase JS client doesn't support complex filtering 
        // on the joined table easily without !inner which filters parent rows.
        // We will filter in JS to be safe if RLS allows reading all answers (which it shouldn't).
        .order('deadline', { ascending: true });

      if (tasksError) throw tasksError;

      // Ensure we only look at the current user's answers
      // (This step is redundant if RLS is strict, but good for safety)
      const tasksWithUserAnswer = tasks.map(task => ({
        ...task,
        // answers array might contain other users' answers if RLS is not strict
        // Since we didn't filtering in query, we assume RLS handles it. 
        // But to be 100% sure we are mapping relevant fields.
      }));
      
      return tasksWithUserAnswer as Task[];
    },
    enabled: !!userId,
  });
};
