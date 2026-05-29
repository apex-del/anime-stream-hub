import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

// Counts of followers / following for a profile
export function useFollowCounts(userId?: string) {
  return useQuery({
    queryKey: ["follow-counts", userId],
    queryFn: async () => {
      if (!userId) return { followers: 0, following: 0 };
      const [followers, following] = await Promise.all([
        supabase.from("follows" as any).select("id", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("follows" as any).select("id", { count: "exact", head: true }).eq("follower_id", userId),
      ]);
      return { followers: followers.count ?? 0, following: following.count ?? 0 };
    },
    enabled: !!userId,
  });
}

// Whether the current user follows targetId
export function useIsFollowing(targetId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-following", user?.id, targetId],
    queryFn: async () => {
      if (!user || !targetId) return false;
      const { data } = await supabase
        .from("follows" as any)
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!targetId,
  });
}

export function useToggleFollow() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ targetId, isFollowing }: { targetId: string; isFollowing: boolean }) => {
      if (!user) throw new Error("Sign in required");
      if (isFollowing) {
        const { error } = await supabase
          .from("follows" as any)
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows" as any)
          .insert({ follower_id: user.id, following_id: targetId } as any);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["is-following"] });
      qc.invalidateQueries({ queryKey: ["follow-counts"] });
      toast({ title: v.isFollowing ? "Unfollowed" : "Following" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });
}
