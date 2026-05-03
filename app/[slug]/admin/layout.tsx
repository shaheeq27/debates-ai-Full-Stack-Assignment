import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getProjectBySlug } from "@/lib/services/project.service";
import { canAccessAdminDashboard } from "@/lib/access/rules";
import { IProject } from "@/lib/db/models/Project";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const project = await getProjectBySlug(params.slug);
  if (!project) redirect("/login");

  // Server-side admin guard
  if (!canAccessAdminDashboard(project as IProject, user)) {
    redirect(`/${params.slug}/chat`);
  }

  return <>{children}</>;
}
