import { getSavedAddresses } from "@/lib/profile-service";

import { AddressesScreen } from "../_components/profile-ui";

export default async function ProfileAddressesPage() {
  const addresses = await getSavedAddresses();
  return <AddressesScreen addresses={addresses} />;
}
