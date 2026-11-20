import { BookOpen, MessagesSquare, Users, FileText, ClipboardList, Clock } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { LineChart } from "@/components/shared/charts";
import { DAY_LABELS, DAY_ORDER } from "@/lib/constants";
import { getClassActivity } from "@/features/representative/services/representative-service";

export default async function RepresentativeNotebookPage() {
  const session = await requireRole(["representative"]);
  const activity = await getClassActivity(session);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manage"
        title="Class activity"
        description="Real engagement counts across the classes you manage. AI-generated summaries and quizzes arrive with Phase 4."
      />

      {!activity.hasData ? (
        <EmptyState
          title="No activity recorded yet"
          description="Once students join your classes and academic material is published, live counts will appear here."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Active students", value: activity.activeStudents, icon: Users },
              { label: "Pending requests", value: activity.pendingMembers, icon: Clock },
              { label: "Discussion messages", value: activity.messages, icon: MessagesSquare },
              { label: "Assignments", value: activity.assignments, icon: ClipboardList },
              { label: "Documents", value: activity.documents, icon: FileText },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className="glass">
                <CardContent className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <p className="text-xs text-muted">{label}</p>
                    <p className="font-heading text-2xl font-extrabold">{value}</p>
                  </div>
                  <Icon className="size-5 text-secondary" aria-hidden="true" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-4 text-secondary" aria-hidden="true" /> Weekly activity
              </CardTitle>
              <CardDescription>Documents, messages and tasks created in the last seven days.</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart points={activity.points} color="#A855F7" />
              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-muted">
                {DAY_ORDER.map((day) => (
                  <span key={day}>{DAY_LABELS[day]?.slice(0, 3) ?? day.slice(0, 3)}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
