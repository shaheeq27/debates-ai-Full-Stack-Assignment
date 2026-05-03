import { connectDB } from "@/lib/db/connect";
import DashboardConfigModel from "@/lib/db/models/DashboardConfig";
import {
  getConversationCount,
  getMessageCount,
  getRecentMessages,
} from "./conversation.service";
import {
  getAllProductInstances,
  getProjectWithMembers,
} from "./project.service";
import UserModel from "@/lib/db/models/User";
import ConversationModel from "@/lib/db/models/Conversation";
import mongoose from "mongoose";

export async function getDashboardConfig(projectId: string) {
  await connectDB();
  return DashboardConfigModel.findOne({ projectId }).lean();
}

export async function updateDashboardConfig(
  projectId: string,
  updates: Partial<{ title: string; sections: unknown[] }>
) {
  await connectDB();
  return DashboardConfigModel.findOneAndUpdate(
    { projectId },
    { $set: updates },
    { new: true, upsert: true }
  ).lean();
}

export async function getDashboardStats(projectId: string, slug: string) {
  const [convCount, msgCount, recentMsgs, project, productInstances, users] =
    await Promise.all([
      getConversationCount(projectId),
      getMessageCount(projectId),
      getRecentMessages(projectId, 8),
      getProjectWithMembers(slug),
      getAllProductInstances(projectId),
      UserModel.find({
        _id: {
          $in:
            (
              await ConversationModel.distinct("userId", {
                projectId: new mongoose.Types.ObjectId(projectId),
              })
            ),
        },
      })
        .select("name email avatarColor")
        .lean(),
    ]);

  const integrations = productInstances.flatMap((pi) => pi.integrations);

  return {
    stats: {
      convCount,
      msgCount,
      memberCount: project?.members.length ?? 0,
      activeUsers: users.length,
    },
    recentMessages: recentMsgs,
    integrations,
    members: project?.members ?? [],
  };
}
