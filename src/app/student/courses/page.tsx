import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { listCourses } from "@/features/courses/services/course-service";
import { CourseDirectory } from "@/features/courses/components/course-directory";

export default async function StudentCoursesPage() {
  const session = await requireRole(["student"]);
  const courses = await listCourses(session);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Courses"
        description="All courses published to the classes you belong to."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}
      <CourseDirectory courses={courses} />
    </div>
  );
}
