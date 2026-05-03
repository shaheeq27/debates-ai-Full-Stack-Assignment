import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getProjectBySlug, getProductInstance } from "@/lib/services/project.service";
import {
  createConversation,
  getConversations,
} from "@/lib/services/conversation.service";
import { canCreateConversation } from "@/lib/access/rules";
import { CreateConversationSchema } from "@/lib/zod/schemas";
import { IProject } from "@/lib/db/models/Project";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Project slug required" }, { status: 400 });

  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (!canCreateConversation(project as unknown as IProject, user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const conversations = await getConversations(project._id.toString(), user.id);
  const serialized = conversations.map((c) => ({
    ...c,
    _id: c._id.toString(),
    projectId: c.projectId.toString(),
    productInstanceId: c.productInstanceId.toString(),
    userId: c.userId.toString(),
  }));

  return NextResponse.json({ data: serialized });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateConversationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Project slug required" }, { status: 400 });

  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (!canCreateConversation(project as unknown as IProject, user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const conversation = await createConversation({
    projectId: project._id.toString(),
    productInstanceId: parsed.data.productInstanceId,
    userId: user.id,
    title: parsed.data.title,
  });

  return NextResponse.json({
    data: {
      ...conversation,
      _id: conversation._id.toString(),
      projectId: conversation.projectId.toString(),
      productInstanceId: conversation.productInstanceId.toString(),
      userId: conversation.userId.toString(),
    },
  });
}
