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
          stats: { completedTasks: 0, pendingTasks: 0, averageScore: 0 },
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

      // 4. Guruh ma'lumotlari
      const { data: groups, error: groupsError } = await supabase
        .from("groups")
        .select("id, name")
        .in("id", groupIds);
      if (groupsError) throw groupsError;

      // 5. Guruh a'zolari sonini olish (barcha a'zolar)
      const { data: allMembers } = await supabase
        .from("group_members")
        .select("group_id")
        .in("group_id", groupIds);
      
      // Guruh a'zolarini hisoblash
      const memberCounts: Record<string, number> = {};
      if (allMembers) {
        allMembers.forEach(m => {
          memberCounts[m.group_id] = (memberCounts[m.group_id] || 0) + 1;
        });
      }

      const groupMap = Object.fromEntries((groups || []).map((g) => [g.id, g.name]));

      // 6. Statistika
      const scoredAnswers = (answers || []).filter((a) => a.score !== null);
      
      // Bajarilganlar = Baholanganlar (yoki shunchaki answer borlar: answers.length)
      // "Bajarildi" odatda topshirilganini bildiradi, baho shart emas.
      const completedCount = (answers || []).length; 
      const totalTasksCount = (tasks || []).length;
      const pendingCount = totalTasksCount - completedCount;

      const averageScore = scoredAnswers.length > 0
        ? scoredAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / scoredAnswers.length
        : 0;

      // 7. Guruhlar ro'yxatini boyitish
      const enrichedGroups = (groups || []).map(group => {
         // Shu guruhning tasklari
         const groupTasks = (tasks || []).filter(t => t.group_id === group.id);
         
         // Kelajakdagi eng yaqin task (Next Task)
         const now = new Date();
         const futureTasks = groupTasks.filter(t => {
            const dateStr = t.type === 'homework' ? t.deadline : t.date;
            if (!dateStr) return false;
            const date = new Date(dateStr);
            return date > now;
         }).sort((a, b) => {
            const dateA = new Date(a.type === 'homework' ? a.deadline! : a.date!);
            const dateB = new Date(b.type === 'homework' ? b.deadline! : b.date!);
            return dateA.getTime() - dateB.getTime();
         });

         const nextTaskTitle = futureTasks.length > 0 
            ? futureTasks[0].title 
            : (groupTasks.length > 0 ? "Vazifalar yo'q" : "Yangi");

         return {
            id: group.id,
            title: group.name,
            schedule: "Online", // Hozircha statik
            status: "Active",   // Hozircha statik
            nextTask: nextTaskTitle,
            memberCount: memberCounts[group.id] || 0
         };
      });

      // Recent Tasks
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
          const dateAStr = a.type === "homework" ? a.deadline : a.date;
          const dateBStr = b.type === "homework" ? b.deadline : b.date;
          const aDate = dateAStr ? new Date(dateAStr) : new Date(8640000000000000); // Far future if null
          const bDate = dateBStr ? new Date(dateBStr) : new Date(8640000000000000);
          return aDate.getTime() - bDate.getTime();
        });

      return {
        stats: { 
          completedTasks: completedCount, 
          pendingTasks: pendingCount, 
          averageScore: Math.round(averageScore * 10) / 10
        },
        recentTasks,
        groups: enrichedGroups,
      };
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
