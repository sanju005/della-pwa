import { getFavoriteProviders } from "@/lib/profile-service";

import { FavoritesScreen } from "../_components/profile-ui";

export default async function ProfileFavoritesPage() {
  const providers = await getFavoriteProviders();
  return <FavoritesScreen providers={providers} />;
}
