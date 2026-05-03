import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getProjectBySlug } from "@/lib/services/project.service";
import { canReadProject } from "@/lib/access/rules";
import { IProject } from "@/lib/db/models/Project";
import { ProjectSidebar } from "@/components/layout/ProjectSidebar";

export default async function ProjectLayout({
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

  if (!canReadProject(project as IProject, user)) {
    redirect("/login");
  }

  const isAdmin = project.members.some(
    (m) => m.userId.toString() === user.id && m.role === "admin"
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <ProjectSidebar
        slug={params.slug}
        projectName={project.name}
        user={user}
        isAdmin={isAdmin}
      />
      <main className="flex-1 overflow-hidden flex flex-col" data-testid="main-content">
        {children}
      </main>
    </div>
  );
}
