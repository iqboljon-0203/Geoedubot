import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useStudentGroupsData(userId: string) {
  return useQuery({
    queryKey: ["student-groups-data", userId],
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

      // 2. Guruh ma'lumotlari
      const { data: groups, error: groupsError } = await supabase
        .from("groups")
        .select("id, name, description, created_by")
        .in("id", groupIds);
      if (groupsError) throw groupsError;

      return groups || [];
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
