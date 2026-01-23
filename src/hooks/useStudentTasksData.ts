import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useStudentTasksData(userId: string) {
  return useQuery({
    queryKey: ["student-tasks-data", userId],
    queryFn: async () => {
      // 1. Student a'zo bo'lgan guruhlar
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);
      if (memberError) throw memberError;
      
      const groupIds = (memberData || []).map((m) => m.group_id);
      
      if (!groupIds.length) {
        return [];
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
        .select("id, task_id, score")
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

      // 5. Topshiriqlarni qaytarish (hasSubmitted va score bilan)
      return (tasks || []).map((t) => {
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
      });
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
