import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectMember {
  userId: mongoose.Types.ObjectId;
  role: "admin" | "member";
}

export interface IProject extends Document {
  name: string;
  slug: string;
  description: string;
  members: IProjectMember[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    members: [ProjectMemberSchema],
  },
  { timestamps: true }
);

ProjectSchema.index({ slug: 1 });

const ProjectModel: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>("Project", ProjectSchema);

export default ProjectModel;
