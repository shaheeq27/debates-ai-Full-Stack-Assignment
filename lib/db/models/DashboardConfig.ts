import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDashboardWidget {
  id: string;
  type:
    | "stat-card"
    | "toggle-list"
    | "message-log"
    | "activity-chart"
    | "integration-status";
  label: string;
  dataKey: string;
  order: number;
}

export interface IDashboardSection {
  id: string;
  label: string;
  order: number;
  icon: string;
  widgets: IDashboardWidget[];
}

export interface IDashboardConfig extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  sections: IDashboardSection[];
  updatedAt: Date;
}

const WidgetSchema = new Schema<IDashboardWidget>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "stat-card",
        "toggle-list",
        "message-log",
        "activity-chart",
        "integration-status",
      ],
      required: true,
    },
    label: { type: String, required: true },
    dataKey: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const SectionSchema = new Schema<IDashboardSection>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    order: { type: Number, required: true },
    icon: { type: String, required: true },
    widgets: [WidgetSchema],
  },
  { _id: false }
);

const DashboardConfigSchema = new Schema<IDashboardConfig>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
    },
    title: { type: String, default: "Project Dashboard" },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

const DashboardConfigModel: Model<IDashboardConfig> =
  mongoose.models.DashboardConfig ??
  mongoose.model<IDashboardConfig>("DashboardConfig", DashboardConfigSchema);

export default DashboardConfigModel;
