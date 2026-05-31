import { MarketplaceScreen } from "../home/_components/marketplace-ui";
import { getMarketplaceData } from "@/lib/provider-marketplace";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const data = await getMarketplaceData();

  return (
    <MarketplaceScreen
      {...data}
      title="Meet DELLA providers"
      subtitle="These are the approved and visible provider listings currently available in your Supabase data."
    />
  );
}
