import { AuthPlaceholder } from "../onboarding/_components/onboarding-ui";

export default function HomePage() {
  return (
    <AuthPlaceholder
      title="Welcome home"
      subtitle="Guest access from onboarding now lands here, ready for the rest of the app flow."
      href="/onboarding/ready"
    />
  );
}
