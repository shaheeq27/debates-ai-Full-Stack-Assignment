"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateConversation, useProject } from "@/hooks";

export default function NewConversationPage({ params }: { params: { slug: string; convId: string } }) {
  const router = useRouter();
  const { data: project } = useProject(params.slug);
  const createConv = useCreateConversation(params.slug);

  useEffect(() => {
    const create = async () => {
      if (!project) return;

      // Fetch product instance id
      const res = await fetch(`/api/integrations?slug=${params.slug}`);
      const piRes = await fetch(`/api/projects/${params.slug}`);
      const piData = await piRes.json();

      // Get the first product instance  
      const instRes = await fetch(`/api/conversations?slug=${params.slug}`);
      const convData = await instRes.json();

      // We need the productInstanceId — fetch it from a dedicated route
      const prodRes = await fetch(`/api/product-instance?slug=${params.slug}`);
      const prodData = await prodRes.json();

      if (prodData.data) {
        try {
          const newConv = await createConv.mutateAsync(prodData.data._id);
          router.replace(`/${params.slug}/chat/${newConv._id}`);
        } catch {
          router.replace(`/${params.slug}/chat`);
        }
      } else {
        router.replace(`/${params.slug}/chat`);
      }
    };
    create();
  }, [project, params.slug]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-sm text-[#9090a8]">Creating conversation…</p>
      </div>
    </div>
  );
}
