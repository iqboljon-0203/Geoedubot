import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useStudentGroups(userId: string) {
  return useQuery({
    queryKey: ["student-groups", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);
      if (error) throw error;
      // Guruh ID laridan guruhlarni olish
      const groupIds = data?.map((g: any) => g.group_id) || [];
      if (!groupIds.length) return [];
      const { data: groups, error: groupError } = await supabase
        .from("groups")
        .select("id, name, created_by")
        .in("id", groupIds);
      if (groupError) throw groupError;
      return groups;
    },
    staleTime: 1000 * 60 * 2,
  });
}
