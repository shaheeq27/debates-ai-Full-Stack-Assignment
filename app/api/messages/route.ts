import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getProjectBySlug, getProductInstance } from "@/lib/services/project.service";
import {
  getConversationById,
  getMessages,
  saveMessage,
  updateConversationTitle,
  createConversation,
} from "@/lib/services/conversation.service";
import { generateAIResponse } from "@/lib/services/ai.service";
import { canSendMessage } from "@/lib/access/rules";
import { SendMessageSchema } from "@/lib/zod/schemas";
import { IProject } from "@/lib/db/models/Project";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversationId = req.nextUrl.searchParams.get("conversationId");
  const slug = req.nextUrl.searchParams.get("slug");

  if (!conversationId || !slug) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (!canSendMessage(project as IProject, user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await getMessages(conversationId);
  const serialized = messages.map((m) => ({
    ...m,
    _id: m._id.toString(),
    conversationId: m.conversationId.toString(),
  }));

  return NextResponse.json({ data: serialized });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = SendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Project slug required" }, { status: 400 });

  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (!canSendMessage(project as IProject, user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get or create conversation
  let conversationId = parsed.data.conversationId;
  let conversation;

  if (conversationId) {
    conversation = await getConversationById(conversationId, project._id.toString());
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
  } else {
    // Auto-create conversation
    const productInstance = await getProductInstance(project._id.toString());
    if (!productInstance) {
      return NextResponse.json({ error: "No product instance found" }, { status: 404 });
    }

    conversation = await createConversation({
      projectId: project._id.toString(),
      productInstanceId: productInstance._id.toString(),
      userId: user.id,
      title: parsed.data.content.slice(0, 50),
    });
    conversationId = conversation._id.toString();
  }

  // Save user message
  const userMsg = await saveMessage({
    conversationId: conversationId!,
    role: "user",
    content: parsed.data.content,
  });

  // Get conversation history for context
  const history = await getMessages(conversationId!);
  const historyForAI = history
    .filter((m) => m._id.toString() !== userMsg._id.toString())
    .slice(-10)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // Get integration toggles from product instance
  const productInstance = await getProductInstance(project._id.toString());
  const integrations = productInstance?.integrations ?? [];

  // Call AI service (controlled flow)
  const { content, steps } = await generateAIResponse({
    userMessage: parsed.data.content,
    conversationHistory: historyForAI,
    integrations: integrations as Parameters<typeof generateAIResponse>[0]["integrations"],
    projectName: project.name,
  });

  // Save assistant message
  const assistantMsg = await saveMessage({
    conversationId: conversationId!,
    role: "assistant",
    content,
    steps,
  });

  // Update conversation title if first message
  if (history.length <= 1) {
    await updateConversationTitle(
      conversationId!,
      parsed.data.content.slice(0, 60),
      content.slice(0, 100)
    );
  }

  return NextResponse.json({
    data: {
      conversationId,
      userMessage: {
        ...userMsg,
        _id: userMsg._id.toString(),
        conversationId: userMsg.conversationId.toString(),
      },
      assistantMessage: {
        ...assistantMsg,
        _id: assistantMsg._id.toString(),
        conversationId: assistantMsg.conversationId.toString(),
        steps,
      },
    },
  });
}
