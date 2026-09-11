import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Backdrop } from "@/chrome/Backdrop";
import styles from "../../screens.module.css";
import type_ from "@/ui/type.module.css";

/**
 * The record editor. Fields, cover drop target, the track list with its
 * reorder pairs, and the remove control that arms in place rather than opening
 * a modal — there are no modals anywhere in this design.
 *
 * Milestone 4. Behind admin auth, which does not exist yet, so for now it is
 * the shell and a back link.
 */
export default async function EditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Backdrop>
      <section className={styles.desk}>
        <Link href="/admin" className={styles.backLink}>
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
          Back to the desk
        </Link>
        <h1 className={type_.albumTitle}>{slug}</h1>
        <p className={styles.pending}>The editor opens in milestone 4.</p>
      </section>
    </Backdrop>
  );
}
