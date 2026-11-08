import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/auth/auth.module.css";
import { SignupForm } from "@/components/auth/signup-form";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage(): React.JSX.Element {
  return (
    <>
      <div className={styles.heading}>
        <h2 className={`display ${styles.title}`}>Create your account</h2>
        <p className="muted">
          Already on SoundCircle? <Link href={routes.login}>Log in</Link>
        </p>
      </div>
      <SignupForm />
    </>
  );
}
