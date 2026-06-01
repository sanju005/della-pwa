import { ProvidersCatalogScreen } from "./providers-catalog-screen";
import {
  buildCategoryBannerSrc,
  buildProviderDetailHref,
  buildProviderPortraitSrc,
  getProviderCatalog,
} from "@/lib/provider-catalog";

export const dynamic = "force-dynamic";

export default async function ProvidersPage(props: {
  searchParams: Promise<{ service?: string }>;
}) {
  const searchParams = await props.searchParams;
  const data = await getProviderCatalog(searchParams.service ?? null);
  const screenData = {
    ...data,
    bannerSrc: buildCategoryBannerSrc(data.service),
    listings: data.listings.map((listing) => ({
      ...listing,
      href: buildProviderDetailHref(listing),
      portraitSrc: buildProviderPortraitSrc(listing),
    })),
  };

  return <ProvidersCatalogScreen data={screenData} />;
}
