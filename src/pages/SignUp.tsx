import { AuthForm } from "@/components/AuthForm";
import { PageMeta } from "@/components/PageMeta";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign up — Video Speed Reader"
        description="Create a Video Speed Reader account and get transcripts in three minutes."
      />
      <AuthForm mode="signup" />
    </>
  );
}
