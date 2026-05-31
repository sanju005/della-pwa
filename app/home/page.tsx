import { MarketplaceScreen } from "./_components/marketplace-ui";
import { getMarketplaceData } from "@/lib/provider-marketplace";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getMarketplaceData();

  return <MarketplaceScreen {...data} />;
}
