"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./AdminBar.module.css";

/**
 * The bar above the public screens while the owner is signed in.
 *
 * It exists so the owner always knows they are not seeing what a listener sees:
 * signed in, phrases are bypassed and drafts appear in the catalog, and without
 * this bar there would be nothing on screen to say so.
 */
export function AdminBar({ note }: { note: string }) {
  const router = useRouter();

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <span className={styles.label}>Signed in as admin</span>
        <span className={styles.note}>{note}</span>
        <div className={styles.actions}>
          <Link href="/admin" className={styles.desk}>
            The desk
          </Link>
          <button
            type="button"
            className={styles.signOut}
            onClick={async () => {
              await fetch("/api/admin/session", { method: "DELETE" });
              router.refresh();
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
