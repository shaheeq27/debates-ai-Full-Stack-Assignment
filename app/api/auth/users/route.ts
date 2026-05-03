import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import UserModel from "@/lib/db/models/User";

export async function GET() {
  try {
    await connectDB();
    const users = await UserModel.find({}).select("_id name email avatarColor").lean();
    return NextResponse.json({
      data: users.map((u) => ({ ...u, _id: u._id.toString() })),
    });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
