"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Conversation, Message, DashboardConfig, SessionUser } from "@/types";

// ──────────────────────────────────────────────
// Auth hooks
// ──────────────────────────────────────────────
export function useCurrentUser() {
  return useQuery<SessionUser>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Not authenticated");
      const json = await res.json();
      return json.data;
    },
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/login", { method: "DELETE" });
    },
    onSuccess: () => {
      qc.clear();
    },
  });
}

// ──────────────────────────────────────────────
// Project hooks
// ──────────────────────────────────────────────
export function useProject(slug: string) {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}`);
      if (!res.ok) throw new Error("Project not found");
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug,
  });
}

// ──────────────────────────────────────────────
// Conversation hooks
// ──────────────────────────────────────────────
export function useConversations(slug: string) {
  return useQuery<Conversation[]>({
    queryKey: ["conversations", slug],
    queryFn: async () => {
      const res = await fetch(`/api/conversations?slug=${slug}`);
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug,
    refetchInterval: 30000,
  });
}

export function useCreateConversation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productInstanceId: string) => {
      const res = await fetch(`/api/conversations?slug=${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productInstanceId }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      const json = await res.json();
      return json.data as Conversation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations", slug] });
    },
  });
}

// ──────────────────────────────────────────────
// Messages hooks
// ──────────────────────────────────────────────
export function useMessages(slug: string, conversationId: string | null) {
  return useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await fetch(
        `/api/messages?slug=${slug}&conversationId=${conversationId}`
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const json = await res.json();
      return json.data;
    },
    enabled: !!conversationId && !!slug,
  });
}

export function useSendMessage(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      content: string;
      conversationId?: string;
    }) => {
      const res = await fetch(`/api/messages?slug=${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to send message");
      }
      const json = await res.json();
      return json.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: ["messages", data.conversationId],
      });
      qc.invalidateQueries({ queryKey: ["conversations", slug] });
    },
  });
}

// ──────────────────────────────────────────────
// Dashboard hooks
// ──────────────────────────────────────────────
export function useDashboard(slug: string) {
  return useQuery<{ config: DashboardConfig | null; stats: unknown }>({
    queryKey: ["dashboard", slug],
    queryFn: async () => {
      const res = await fetch(`/api/admin/dashboard?slug=${slug}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug,
  });
}

// ──────────────────────────────────────────────
// Integration hooks
// ──────────────────────────────────────────────
export function useIntegrations(slug: string) {
  return useQuery({
    queryKey: ["integrations", slug],
    queryFn: async () => {
      const res = await fetch(`/api/integrations?slug=${slug}`);
      if (!res.ok) throw new Error("Failed to fetch integrations");
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug,
  });
}

export function useToggleIntegration(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      type: "shopify" | "crm";
      enabled: boolean;
    }) => {
      const res = await fetch(`/api/integrations?slug=${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update integration");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations", slug] });
      qc.invalidateQueries({ queryKey: ["dashboard", slug] });
    },
  });
}
