export type UserRole = "admin" | "member";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
}

export interface ProjectMember {
  userId: string;
  role: UserRole;
  user?: User;
}

export interface Project {
  _id: string;
  name: string;
  slug: string;
  description: string;
  members: ProjectMember[];
  createdAt: string;
}

export type IntegrationType = "shopify" | "crm";

export interface Integration {
  type: IntegrationType;
  enabled: boolean;
  name: string;
  config: Record<string, unknown>;
}

export interface ProductInstance {
  _id: string;
  projectId: string;
  productType: string;
  namespace: string;
  name: string;
  integrations: Integration[];
  createdAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  steps?: string[];
  createdAt: string;
}

export interface Conversation {
  _id: string;
  projectId: string;
  productInstanceId: string;
  userId: string;
  title: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export type WidgetType =
  | "stat-card"
  | "toggle-list"
  | "message-log"
  | "activity-chart"
  | "integration-status";

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  label: string;
  dataKey: string;
  order: number;
}

export interface DashboardSection {
  id: string;
  label: string;
  order: number;
  icon: string;
  widgets: DashboardWidget[];
}

export interface DashboardConfig {
  _id: string;
  projectId: string;
  title: string;
  sections: DashboardSection[];
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
