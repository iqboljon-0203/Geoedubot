import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export interface DashboardStats {
  totalStudents: number;
  activeGroups: number;
  totalTasks: number;
  pendingReviews: number;
}

export interface ActivityItem {
  id: string;
  type: 'group_join' | 'task_submit' | 'new_group' | 'new_task';
  title: string;
  subtitle: string;
  timestamp: string;
  user?: string;
  meta?: any;
}

export const useTeacherDashboardData = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['teacher-dashboard', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      // 1. Get Groups created by teacher
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, created_at')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      const groupIds = groups.map(g => g.id);
      
      // If no groups, return empty stats
      if (groupIds.length === 0) {
        return {
          stats: { totalStudents: 0, activeGroups: 0, totalTasks: 0, pendingReviews: 0 },
          recentActivity: []
        };
      }

      // 2. Get Students count (in teacher's groups)
      const { count: studentsCount, error: studentsError } = await supabase
        .from('group_members')
        .select('id', { count: 'exact', head: true })
        .in('group_id', groupIds);

      if (studentsError) throw studentsError;

      // 3. Get Total Tasks count
      const { count: totalTasksCount, error: totalTasksError } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .in('group_id', groupIds);
        
      if (totalTasksError) throw totalTasksError;

      // 4. Get recent tasks for activity feed
      const { data: recentTasks } = await supabase
        .from('tasks')
        .select('id, title, created_at, group_id')
        .in('group_id', groupIds)
        .order('created_at', { ascending: false })
        .limit(5);

      // 5. Get Pending Reviews & Recent Submissions
      const { data: allTeacherTasks } = await supabase
        .from('tasks')
        .select('id')
        .in('group_id', groupIds);
        
      const allTaskIds = allTeacherTasks?.map(t => t.id) || [];
      
      let pendingReviews = 0;
      let recentSubmissions: any[] = [];

      if (allTaskIds.length > 0) {
        // Pending reviews count
        const { count, error: pendingError } = await supabase
           .from('answers')
           .select('id', { count: 'exact', head: true })
           .in('task_id', allTaskIds)
           .is('score', null);

        if (!pendingError) pendingReviews = count || 0;

        // Recent submissions for activity
        const { data: submissions } = await supabase
            .from('answers')
            .select(`
                id,
                created_at,
                task_id,
                tasks (title),
                user_id,
                profiles:user_id (full_name)
            `)
            .in('task_id', allTaskIds)
            .order('created_at', { ascending: false })
            .limit(5);
        recentSubmissions = submissions || [];
      }

      // 6. Get Recent Group Joins
      const { data: recentJoins } = await supabase
        .from('group_members')
        .select(`
           id,
           created_at,
           group_id,
           groups (name),
           user_id,
           profiles:user_id (full_name)
        `)
        .in('group_id', groupIds)
        .order('created_at', { ascending: false })
        .limit(5);


      // 7. Construct Activity Feed
      const activities: ActivityItem[] = [];

      // Add recent groups
      groups.slice(0, 3).forEach(g => {
        activities.push({
            id: `group-${g.id}`,
            type: 'new_group',
            title: 'Created New Group',
            subtitle: g.name,
            timestamp: g.created_at
        });
      });

      // Add recent tasks
      recentTasks?.forEach(t => {
         activities.push({
            id: `task-${t.id}`,
            type: 'new_task',
            title: 'Assigned New Task',
            subtitle: t.title,
            timestamp: t.created_at
         });
      });

      // Add recent submissions
      recentSubmissions.forEach(s => {
          activities.push({
              id: `sub-${s.id}`,
              type: 'task_submit',
              title: 'New Submission',
              subtitle: `${s.profiles?.full_name} submitted on ${s.tasks?.title}`,
              timestamp: s.created_at,
              user: s.profiles?.full_name,
              meta: { answerId: s.id }
          });
      });
      
      // Add recent joins
      recentJoins?.forEach(j => {
         activities.push({
            id: `join-${j.id}`,
            type: 'group_join',
            title: 'New Student Joined',
            subtitle: `${j.profiles?.full_name} joined ${j.groups?.name}`,
            timestamp: j.created_at,
            user: j.profiles?.full_name
         });
      });

      // Sort by latest
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        stats: {
          totalStudents: studentsCount || 0,
          activeGroups: groups.length,
          totalTasks: totalTasksCount || 0,
          pendingReviews
        },
        recentActivity: activities.slice(0, 10)
      };
    },
    enabled: !!userId,
  });
};
