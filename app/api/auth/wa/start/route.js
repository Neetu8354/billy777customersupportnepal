import { waStart, methods, ccDigits } from "@/lib/authx";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!methods().waMsg) return Response.json({ success: false, error: "Ye login abhi band hai" }, { status: 403 });
  let b = {};
  try { b = await req.json(); } catch {}
  const mobile = String(b.mobile || "").replace(/\D/g, "").replace(/^0+/, "");
  const cc = String(b.cc || "977").replace(/\D/g, "").slice(0, 4) || "977";
  if (mobile.length !== ccDigits(cc)) return Response.json({ success: false, error: `${ccDigits(cc)}-digit mobile daalo` }, { status: 400 });
  return Response.json({ success: true, ...(await waStart(mobile, cc)) });
}
