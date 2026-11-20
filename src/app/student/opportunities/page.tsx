import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { listTasks } from "@/features/tasks/services/task-service";
import { isActiveOpportunity } from "@/features/shared/format";
import { OpportunityBoard } from "@/features/opportunities/components/opportunity-board";

export default async function StudentOpportunitiesPage() {
  const session = await requireRole(["student"]);
  const tasks = await listTasks(session);
  const opportunities = tasks.filter((task) => isActiveOpportunity(task));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Discover"
        title="Opportunities"
        description="Hackathons, internships, scholarships and events shared by your representatives."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}
      <OpportunityBoard opportunities={opportunities} />
    </div>
  );
}
