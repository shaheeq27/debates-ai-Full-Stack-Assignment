import { z } from "zod";

export const SendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(4000, "Message too long"),
  conversationId: z.string().optional(),
});

export const CreateConversationSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  productInstanceId: z.string().min(1, "Product instance required"),
});

export const LoginSchema = z.object({
  userId: z.string().min(1, "User ID required"),
});

export const UpdateIntegrationSchema = z.object({
  type: z.enum(["shopify", "crm"]),
  enabled: z.boolean(),
});

export const UpdateDashboardConfigSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  sections: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      order: z.number(),
      icon: z.string(),
      widgets: z.array(
        z.object({
          id: z.string(),
          type: z.enum([
            "stat-card",
            "toggle-list",
            "message-log",
            "activity-chart",
            "integration-status",
          ]),
          label: z.string(),
          dataKey: z.string(),
          order: z.number(),
        })
      ),
    })
  ).optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateIntegrationInput = z.infer<typeof UpdateIntegrationSchema>;
export type UpdateDashboardConfigInput = z.infer<typeof UpdateDashboardConfigSchema>;
