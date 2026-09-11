import { notFound } from "next/navigation";

import { Backdrop } from "@/chrome/Backdrop";
import { getAdminRecord, isAdmin } from "@/data/admin";
import { Editor } from "./Editor";

export const dynamic = "force-dynamic";

/**
 * The record editor.
 *
 * 404s for anyone not signed in — the same answer a missing record gives, so
 * the desk does not confirm its own existence to someone who cannot open it.
 */
export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) notFound();

  const { id } = await params;
  const record = await getAdminRecord(id);
  if (!record) notFound();

  return (
    <Backdrop>
      <Editor record={record} />
    </Backdrop>
  );
}
