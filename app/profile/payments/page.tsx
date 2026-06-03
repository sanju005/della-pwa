import { getPaymentHistory } from "@/lib/profile-service";

import { PaymentsScreen } from "../_components/profile-ui";

export default async function ProfilePaymentsPage() {
  const payments = await getPaymentHistory();
  return <PaymentsScreen payments={payments} />;
}
