import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getProjectBySlug } from "@/lib/services/project.service";
import {
  getDashboardConfig,
  getDashboardStats,
  updateDashboardConfig,
} from "@/lib/services/dashboard.service";
import { canAccessAdminDashboard } from "@/lib/access/rules";
import { UpdateDashboardConfigSchema } from "@/lib/zod/schemas";
import { IProject } from "@/lib/db/models/Project";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Project slug required" }, { status: 400 });

  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Admin-only access check
  if (!canAccessAdminDashboard(project as unknown as IProject, user)) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const [config, stats] = await Promise.all([
    getDashboardConfig(project._id.toString()),
    getDashboardStats(project._id.toString(), slug),
  ]);

  return NextResponse.json({
    data: {
      config: config
        ? { ...config, _id: config._id.toString(), projectId: config.projectId.toString() }
        : null,
      stats,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Project slug required" }, { status: 400 });

  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (!canAccessAdminDashboard(project as unknown as IProject, user)) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateDashboardConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const updated = await updateDashboardConfig(project._id.toString(), parsed.data);
  return NextResponse.json({ data: updated });
}
