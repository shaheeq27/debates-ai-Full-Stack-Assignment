import {
  SendMessageSchema,
  CreateConversationSchema,
  LoginSchema,
  UpdateIntegrationSchema,
} from "@/lib/zod/schemas";

describe("Zod Schemas", () => {
  describe("SendMessageSchema", () => {
    it("accepts valid message", () => {
      const result = SendMessageSchema.safeParse({ content: "Hello!" });
      expect(result.success).toBe(true);
    });
    it("rejects empty content", () => {
      const result = SendMessageSchema.safeParse({ content: "" });
      expect(result.success).toBe(false);
    });
    it("rejects message over 4000 chars", () => {
      const result = SendMessageSchema.safeParse({ content: "x".repeat(4001) });
      expect(result.success).toBe(false);
    });
    it("accepts optional conversationId", () => {
      const result = SendMessageSchema.safeParse({
        content: "Hi",
        conversationId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("CreateConversationSchema", () => {
    it("accepts valid input", () => {
      const result = CreateConversationSchema.safeParse({
        productInstanceId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(true);
    });
    it("rejects missing productInstanceId", () => {
      const result = CreateConversationSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("LoginSchema", () => {
    it("accepts valid userId", () => {
      const result = LoginSchema.safeParse({ userId: "abc123" });
      expect(result.success).toBe(true);
    });
    it("rejects empty userId", () => {
      const result = LoginSchema.safeParse({ userId: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateIntegrationSchema", () => {
    it("accepts valid shopify toggle", () => {
      const result = UpdateIntegrationSchema.safeParse({ type: "shopify", enabled: true });
      expect(result.success).toBe(true);
    });
    it("accepts valid crm toggle", () => {
      const result = UpdateIntegrationSchema.safeParse({ type: "crm", enabled: false });
      expect(result.success).toBe(true);
    });
    it("rejects invalid type", () => {
      const result = UpdateIntegrationSchema.safeParse({ type: "stripe", enabled: true });
      expect(result.success).toBe(false);
    });
  });
});
