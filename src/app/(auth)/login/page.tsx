import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/auth/auth.module.css";
import { LoginForm } from "@/components/auth/login-form";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage(): React.JSX.Element {
  return (
    <>
      <div className={styles.heading}>
        <h2 className={`display ${styles.title}`}>Welcome back</h2>
        <p className="muted">
          New here? <Link href={routes.signup}>Create an account</Link>
        </p>
      </div>
      <LoginForm />
    </>
  );
}
