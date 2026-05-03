import { connectDB } from "@/lib/db/connect";
import ProjectModel from "@/lib/db/models/Project";
import ProductInstanceModel from "@/lib/db/models/ProductInstance";
import UserModel from "@/lib/db/models/User";

export async function getProjectBySlug(slug: string) {
  await connectDB();
  return ProjectModel.findOne({ slug }).lean();
}

export async function getProjectWithMembers(slug: string) {
  await connectDB();
  const project = await ProjectModel.findOne({ slug }).lean();
  if (!project) return null;

  // Populate member user data
  const memberIds = project.members.map((m) => m.userId);
  const users = await UserModel.find({ _id: { $in: memberIds } }).lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return {
    ...project,
    _id: project._id.toString(),
    members: project.members.map((m) => ({
      ...m,
      userId: m.userId.toString(),
      user: userMap.get(m.userId.toString()),
    })),
  };
}

export async function getProductInstance(projectId: string) {
  await connectDB();
  return ProductInstanceModel.findOne({ projectId }).lean();
}

export async function getAllProductInstances(projectId: string) {
  await connectDB();
  return ProductInstanceModel.find({ projectId }).lean();
}

export async function updateIntegrationToggle(
  productInstanceId: string,
  integrationType: "shopify" | "crm",
  enabled: boolean
) {
  await connectDB();
  return ProductInstanceModel.findByIdAndUpdate(
    productInstanceId,
    {
      $set: {
        "integrations.$[elem].enabled": enabled,
      },
    },
    {
      arrayFilters: [{ "elem.type": integrationType }],
      new: true,
    }
  ).lean();
}
