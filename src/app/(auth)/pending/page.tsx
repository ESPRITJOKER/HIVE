"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Clock3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { signOut } from "@/features/authentication/services/auth-service";
import { getBrowserSupabase } from "@/lib/supabase/client";
import type { MembershipStatus } from "@/types/domain";

export default function PendingPage() {
  const router = useRouter();

  // Server state lives in TanStack Query — no setState inside an effect.
  const { data: status, isFetching, refetch } = useQuery<MembershipStatus | "none">({
    queryKey: ["my-membership-status"],
    queryFn: async () => {
      const supabase = getBrowserSupabase();
      if (!supabase) return "none";
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return "none";
      const { data } = await supabase
        .from("class_members")
        .select("membership_status")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data?.membership_status as MembershipStatus) ?? "none";
    },
  });

  const approved = status === "active";

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-accent/15 text-accent">
        <Clock3 className="size-8" aria-hidden="true" />
      </div>

      <div>
        <h1 className="text-3xl font-extrabold">
          {approved ? "You're in!" : status === "rejected" ? "Request not approved" : "Awaiting approval"}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          {approved
            ? "Your class membership is active. You can now access your academic workspace."
            : status === "rejected"
              ? "Your representative declined this request. Contact them or try a different class code."
              : "Your class representative needs to approve your membership before you can access class materials."}
        </p>
      </div>

      <ConfigNotice />

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {approved ? (
          <Button onClick={() => router.push("/student/dashboard")} className="w-full sm:w-auto">
            Open my dashboard
          </Button>
        ) : (
          <Button variant="outline" onClick={() => void refetch()} className="w-full sm:w-auto">
            <RefreshCw className={isFetching ? "animate-spin" : ""} />
            Check status
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
          className="w-full sm:w-auto"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
