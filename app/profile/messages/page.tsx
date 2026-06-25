import { Suspense } from "react";

import { MessagesScreen } from "../_components/profile-ui";

export default function ProfileMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesScreen />
    </Suspense>
  );
}
