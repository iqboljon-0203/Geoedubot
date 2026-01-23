import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useStudentDashboardData(userId: string) {
  return useQuery({
    queryKey: ["student-dashboard-data", userId],
    queryFn: async () => {
      // 1. Student a'zo bo'lgan guruhlar
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);
      if (memberError) throw memberError;
      
      const groupIds = (memberData || []).map((m) => m.group_id);
      
      if (!groupIds.length) {
        return {
          stats: { 
            completedTasks: 0, 
            pendingTasks: 0, 
            averageScore: 0 
          },
          recentTasks: [],
          groups: [],
        };
      }

      // 2. Shu guruhlarga tegishli barcha topshiriqlar
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, description, type, deadline, date, group_id")
        .in("group_id", groupIds);
      if (tasksError) throw tasksError;

      // 3. Student yuborgan javoblar
      const { data: answers, error: answersError } = await supabase
        .from("answers")
        .select("id, task_id, score, description, file_url, created_at")
        .eq("user_id", userId);
      if (answersError) throw answersError;

      // 4. Guruh nomlari
      const { data: groups, error: groupsError } = await supabase
        .from("groups")
        .select("id, name")
        .in("id", groupIds);
      if (groupsError) throw groupsError;

      const groupMap = Object.fromEntries(
        (groups || []).map((g) => [g.id, g.name])
      );

      // 5. Statistika
      const answeredTaskIds = new Set((answers || []).map((a) => a.task_id));
      const completedTasks = (answers || []).filter((a) => a.score !== null).length;
      const pendingTasks = (tasks || []).filter(
        (t) => !answeredTaskIds.has(t.id)
      ).length;

      // O'rtacha bahoni hisoblash
      const scoredAnswers = (answers || []).filter((a) => a.score !== null);
      const averageScore = scoredAnswers.length > 0
        ? scoredAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / scoredAnswers.length
        : 0;

      // 6. Barcha topshiriqlarni qaytarish (hasSubmitted va score bilan)
      const now = new Date();
      const recentTasks = (tasks || [])
        .map((t) => {
          const answer = (answers || []).find((a) => a.task_id === t.id);
          return {
            id: t.id,
            title: t.title,
            description: t.description,
            type: t.type,
            deadline: t.deadline,
            date: t.date,
            group: groupMap[t.group_id] || "",
            hasSubmitted: !!answer,
            score: answer?.score || null,
          };
        })
        .sort((a, b) => {
          // Muddati yaqin bo'lganlarni birinchi qo'yish
          const aDate = new Date(a.type === "homework" ? a.deadline : a.date);
          const bDate = new Date(b.type === "homework" ? b.deadline : b.date);
          return aDate.getTime() - bDate.getTime();
        });

      return {
        stats: { 
          completedTasks, 
          pendingTasks, 
          averageScore: Math.round(averageScore * 10) / 10 // 1 xona
        },
        recentTasks,
        groups: groups || [],
      };
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
