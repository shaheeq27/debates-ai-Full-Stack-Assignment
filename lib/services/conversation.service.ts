import { connectDB } from "@/lib/db/connect";
import ConversationModel from "@/lib/db/models/Conversation";
import MessageModel from "@/lib/db/models/Message";

export async function getConversations(projectId: string, userId: string) {
  await connectDB();
  return ConversationModel.find({ projectId, userId })
    .sort({ updatedAt: -1 })
    .lean();
}

export async function getConversationById(
  conversationId: string,
  projectId: string
) {
  await connectDB();
  return ConversationModel.findOne({
    _id: conversationId,
    projectId,
  }).lean();
}

export async function createConversation(data: {
  projectId: string;
  productInstanceId: string;
  userId: string;
  title?: string;
}) {
  await connectDB();
  const conv = await ConversationModel.create({
    ...data,
    title: data.title ?? "New conversation",
  });
  return conv.toObject();
}

export async function updateConversationTitle(
  conversationId: string,
  title: string,
  lastMessage?: string
) {
  await connectDB();
  return ConversationModel.findByIdAndUpdate(
    conversationId,
    { title, ...(lastMessage ? { lastMessage } : {}) },
    { new: true }
  ).lean();
}

export async function getMessages(conversationId: string) {
  await connectDB();
  return MessageModel.find({ conversationId }).sort({ createdAt: 1 }).lean();
}

export async function saveMessage(data: {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  steps?: string[];
}) {
  await connectDB();
  const msg = await MessageModel.create(data);
  return msg.toObject();
}

export async function getRecentMessages(projectId: string, limit = 10) {
  await connectDB();
  const conversations = await ConversationModel.find({ projectId })
    .select("_id")
    .lean();
  const convIds = conversations.map((c) => c._id);

  return MessageModel.find({ conversationId: { $in: convIds } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getConversationCount(projectId: string) {
  await connectDB();
  return ConversationModel.countDocuments({ projectId });
}

export async function getMessageCount(projectId: string) {
  await connectDB();
  const conversations = await ConversationModel.find({ projectId })
    .select("_id")
    .lean();
  const convIds = conversations.map((c) => c._id);
  return MessageModel.countDocuments({ conversationId: { $in: convIds } });
}
