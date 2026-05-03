import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIntegration {
  type: "shopify" | "crm";
  enabled: boolean;
  name: string;
  config: Record<string, unknown>;
}

export interface IProductInstance extends Document {
  projectId: mongoose.Types.ObjectId;
  productType: string;
  namespace: string;
  name: string;
  integrations: IIntegration[];
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    type: { type: String, enum: ["shopify", "crm"], required: true },
    enabled: { type: Boolean, default: false },
    name: { type: String, required: true },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const ProductInstanceSchema = new Schema<IProductInstance>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    productType: { type: String, required: true, default: "ai-sales-assistant" },
    namespace: { type: String, required: true },
    name: { type: String, required: true },
    integrations: [IntegrationSchema],
  },
  { timestamps: true }
);

ProductInstanceSchema.index({ projectId: 1, namespace: 1 });

const ProductInstanceModel: Model<IProductInstance> =
  mongoose.models.ProductInstance ??
  mongoose.model<IProductInstance>("ProductInstance", ProductInstanceSchema);

export default ProductInstanceModel;
