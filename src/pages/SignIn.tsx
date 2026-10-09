import { AuthForm } from "@/components/AuthForm";
import { PageMeta } from "@/components/PageMeta";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign in — Video Speed Reader"
        description="Sign in to Video Speed Reader to manage your transcripts."
      />
      <AuthForm mode="signin" />
    </>
  );
}
