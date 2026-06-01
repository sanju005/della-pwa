import { MarketplaceScreen } from "./_components/marketplace-ui";
import { getHomeFeedData } from "@/lib/home-feed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomeFeedData();

  return <MarketplaceScreen {...data} />;
}
