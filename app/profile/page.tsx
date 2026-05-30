import { getProfileOverviewData } from "@/lib/profile-service";

import { ProfileOverviewScreen } from "./_components/profile-ui";

export default async function ProfilePage() {
  const data = await getProfileOverviewData();
  return <ProfileOverviewScreen initialData={data} />;
}
