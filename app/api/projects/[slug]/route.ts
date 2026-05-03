import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getProjectBySlug, getProjectWithMembers } from "@/lib/services/project.service";
import { canReadProject } from "@/lib/access/rules";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getProjectBySlug(params.slug);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Authorization check
  if (!canReadProject(project as Parameters<typeof canReadProject>[0], user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fullProject = await getProjectWithMembers(params.slug);
  return NextResponse.json({ data: fullProject });
}
