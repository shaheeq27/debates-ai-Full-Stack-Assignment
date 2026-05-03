import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getProjectBySlug, updateIntegrationToggle, getProductInstance } from "@/lib/services/project.service";
import { canModifyIntegrations } from "@/lib/access/rules";
import { UpdateIntegrationSchema } from "@/lib/zod/schemas";
import { IProject } from "@/lib/db/models/Project";

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Project slug required" }, { status: 400 });

  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (!canModifyIntegrations(project as IProject, user)) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateIntegrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const productInstance = await getProductInstance(project._id.toString());
  if (!productInstance) {
    return NextResponse.json({ error: "No product instance found" }, { status: 404 });
  }

  const updated = await updateIntegrationToggle(
    productInstance._id.toString(),
    parsed.data.type,
    parsed.data.enabled
  );

  return NextResponse.json({ data: updated });
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Project slug required" }, { status: 400 });

  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const productInstance = await getProductInstance(project._id.toString());
  return NextResponse.json({ data: productInstance?.integrations ?? [] });
}
