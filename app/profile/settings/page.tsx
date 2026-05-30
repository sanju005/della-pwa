import { getProfileSettings } from "@/lib/profile-service";

import { SettingsScreen } from "../_components/profile-ui";

export default async function ProfileSettingsPage() {
  const groups = await getProfileSettings();
  return <SettingsScreen groups={groups} />;
}
