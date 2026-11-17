import { getAdmin, adminCanAccess, getUserById, emitToAdmins, db, save } from "@/lib/db";
import { remote, remoteOn } from "@/lib/remote";

export const dynamic = "force-dynamic";

/* "Save contact" — agent renames a customer; the UI then downloads a .vcf */
export async function POST(req) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ success: false }, { status: 401 });
  let b = {};
  try { b = await req.json(); } catch {}
  const userId = Number(b.userId);
  const name = String(b.name || "").trim().slice(0, 80);
  if (!userId || !name) return Response.json({ success: false, error: "Name required" }, { status: 400 });
  const user = await getUserById(userId);
  if (!user) return Response.json({ success: false, error: "User not found" }, { status: 404 });
  if (!adminCanAccess(admin, user)) return Response.json({ success: false, error: "Not your user" }, { status: 403 });

  if (remoteOn) await remote.patchUser(userId, { display_name: name });
  else if (db.users[userId]) { db.users[userId].display_name = name; save(); }

  emitToAdmins(user, "user", {});
  return Response.json({ success: true, user: { id: userId, display_name: name } });
}
