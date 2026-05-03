import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getProjectBySlug, getProductInstance } from "@/lib/services/project.service";
import { canReadProject } from "@/lib/access/rules";
import { IProject } from "@/lib/db/models/Project";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canReadProject(project as IProject, user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const instance = await getProductInstance(project._id.toString());
  if (!instance) return NextResponse.json({ data: null });

  return NextResponse.json({
    data: {
      ...instance,
      _id: instance._id.toString(),
      projectId: instance.projectId.toString(),
    },
  });
}
