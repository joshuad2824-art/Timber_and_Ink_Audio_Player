import { Backdrop } from "@/chrome/Backdrop";
import { deskClaimed, isAdmin, listAllRecords } from "@/data/admin";
import { getSiteText } from "@/data/catalog";
import { Claim } from "./Claim";
import { Desk } from "./Desk";
import { SignIn } from "./SignIn";

export const dynamic = "force-dynamic";

/**
 * One route, three states, all decided on the server: claim it, sign in, or the
 * desk itself. The desk's data is never fetched for someone who is not signed
 * in, so there is nothing to leak into an unauthorized render.
 */
export default async function AdminPage() {
  if (!(await deskClaimed())) {
    return (
      <Backdrop>
        <Claim />
      </Backdrop>
    );
  }

  if (!(await isAdmin())) {
    return (
      <Backdrop>
        <SignIn />
      </Backdrop>
    );
  }

  const [records, siteText] = await Promise.all([listAllRecords(), getSiteText()]);

  return (
    <Backdrop>
      <Desk records={records} siteText={siteText} />
    </Backdrop>
  );
}
