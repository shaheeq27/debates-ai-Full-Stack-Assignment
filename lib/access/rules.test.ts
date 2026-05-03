import {
  isMember,
  isAdmin,
  canReadProject,
  canAccessAdminDashboard,
  canSendMessage,
  canModifyIntegrations,
  getUserRole,
} from "@/lib/access/rules";
import mongoose from "mongoose";

// Mock project factory
const makeProject = (members: Array<{ userId: string; role: "admin" | "member" }>) => ({
  _id: new mongoose.Types.ObjectId(),
  name: "Test Project",
  slug: "test",
  description: "",
  members: members.map((m) => ({
    userId: new mongoose.Types.ObjectId(m.userId),
    role: m.role,
  })),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const ALICE_ID = new mongoose.Types.ObjectId().toString();
const BOB_ID = new mongoose.Types.ObjectId().toString();
const CAROL_ID = new mongoose.Types.ObjectId().toString();

const aliceUser = { id: ALICE_ID, name: "Alice", email: "alice@test.com", avatarColor: "#000" };
const bobUser = { id: BOB_ID, name: "Bob", email: "bob@test.com", avatarColor: "#000" };
const carolUser = { id: CAROL_ID, name: "Carol", email: "carol@test.com", avatarColor: "#000" };

const project = makeProject([
  { userId: ALICE_ID, role: "admin" },
  { userId: BOB_ID, role: "member" },
]);

describe("Access Layer — Pure Rules", () => {
  describe("isMember", () => {
    it("returns true for admin members", () => {
      expect(isMember(project as Parameters<typeof isMember>[0], ALICE_ID)).toBe(true);
    });
    it("returns true for regular members", () => {
      expect(isMember(project as Parameters<typeof isMember>[0], BOB_ID)).toBe(true);
    });
    it("returns false for non-members", () => {
      expect(isMember(project as Parameters<typeof isMember>[0], CAROL_ID)).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("returns true for admins", () => {
      expect(isAdmin(project as Parameters<typeof isAdmin>[0], ALICE_ID)).toBe(true);
    });
    it("returns false for regular members", () => {
      expect(isAdmin(project as Parameters<typeof isAdmin>[0], BOB_ID)).toBe(false);
    });
    it("returns false for non-members", () => {
      expect(isAdmin(project as Parameters<typeof isAdmin>[0], CAROL_ID)).toBe(false);
    });
  });

  describe("canReadProject", () => {
    it("allows members to read", () => {
      expect(canReadProject(project as Parameters<typeof canReadProject>[0], bobUser)).toBe(true);
    });
    it("blocks non-members", () => {
      expect(canReadProject(project as Parameters<typeof canReadProject>[0], carolUser)).toBe(false);
    });
  });

  describe("canAccessAdminDashboard", () => {
    it("allows admins only", () => {
      expect(canAccessAdminDashboard(project as Parameters<typeof canAccessAdminDashboard>[0], aliceUser)).toBe(true);
    });
    it("blocks regular members", () => {
      expect(canAccessAdminDashboard(project as Parameters<typeof canAccessAdminDashboard>[0], bobUser)).toBe(false);
    });
    it("blocks non-members", () => {
      expect(canAccessAdminDashboard(project as Parameters<typeof canAccessAdminDashboard>[0], carolUser)).toBe(false);
    });
  });

  describe("canSendMessage", () => {
    it("allows members to send messages", () => {
      expect(canSendMessage(project as Parameters<typeof canSendMessage>[0], bobUser)).toBe(true);
    });
    it("blocks non-members", () => {
      expect(canSendMessage(project as Parameters<typeof canSendMessage>[0], carolUser)).toBe(false);
    });
  });

  describe("canModifyIntegrations", () => {
    it("allows admin to modify integrations", () => {
      expect(canModifyIntegrations(project as Parameters<typeof canModifyIntegrations>[0], aliceUser)).toBe(true);
    });
    it("blocks regular member", () => {
      expect(canModifyIntegrations(project as Parameters<typeof canModifyIntegrations>[0], bobUser)).toBe(false);
    });
  });

  describe("getUserRole", () => {
    it("returns admin for admin users", () => {
      expect(getUserRole(project as Parameters<typeof getUserRole>[0], ALICE_ID)).toBe("admin");
    });
    it("returns member for members", () => {
      expect(getUserRole(project as Parameters<typeof getUserRole>[0], BOB_ID)).toBe("member");
    });
    it("returns null for non-members", () => {
      expect(getUserRole(project as Parameters<typeof getUserRole>[0], CAROL_ID)).toBe(null);
    });
  });
});
