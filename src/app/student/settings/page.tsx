import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { getProfile } from "@/features/profile/services/profile-service";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { formatDate } from "@/features/shared/format";

export default async function StudentSettingsPage() {
  const session = await requireRole(["student"]);
  const profile = await getProfile(session);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Profile & settings"
        description="Manage your display name and review your account details."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}

      {!profile ? null : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Only your display name is editable here.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm initialName={profile.fullName} />
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Read-only details enforced by database policy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Email</span>
                <span className="font-medium">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Role</span>
                <Badge variant="info">{profile.role}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Joined</span>
                <span className="font-medium">{formatDate(profile.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass lg:col-span-2">
            <CardHeader>
              <CardTitle>Classes</CardTitle>
              <CardDescription>Your class memberships and approval status.</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.classes.length === 0 ? (
                <EmptyState title="No classes yet" description="Join a class using a code from your representative." />
              ) : (
                <ul className="divide-y divide-border">
                  {profile.classes.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted">{item.code}</p>
                      </div>
                      <Badge
                        variant={
                          item.status === "active"
                            ? "success"
                            : item.status === "pending"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {item.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
