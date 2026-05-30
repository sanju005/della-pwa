import { getEditableProfileData } from "@/lib/profile-service";

import { EditProfileScreen } from "../_components/profile-ui";

export default async function EditProfilePage() {
  const profile = await getEditableProfileData();
  return <EditProfileScreen initialProfile={profile} />;
}
