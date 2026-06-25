import { Suspense } from "react";

import { MessagesScreen } from "../_components/provider-screens";

export default function ProviderMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesScreen />
    </Suspense>
  );
}
