import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { AlertCircle } from "lucide-react";
import { getSystemSettings } from "@/features/administrator/services/platform-settings-service";
import { SystemSettingsForm } from "@/features/administrator/components/screens";

export default async function AdminSettingsPage() {
  const session = await requireRole(["administrator"]);
  const settings = await getSystemSettings(session);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="System settings"
        description="Persisted platform configuration. Only settings with a real runtime effect are exposed."
      />

      {!settings.persisted ? (
        <div role="status" className="flex gap-3 rounded-md border border-info/40 bg-info/10 p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
          <p className="text-muted">
            No value is stored yet — the default of {settings.maxUploadMb} MB is in effect. Saving writes to the
            administrator-only <code className="text-foreground">platform_settings</code> table.
          </p>
        </div>
      ) : null}

      <SystemSettingsForm maxUploadMb={settings.maxUploadMb} />
    </div>
  );
}
