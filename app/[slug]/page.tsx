import { redirect } from "next/navigation";

export default function ProjectHome({ params }: { params: { slug: string } }) {
  redirect(`/${params.slug}/chat`);
}
