import { MarketplaceScreen } from "../home/_components/marketplace-ui";
import { getHomeFeedData } from "@/lib/home-feed";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const data = await getHomeFeedData();

  return <MarketplaceScreen {...data} />;
}
