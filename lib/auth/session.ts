import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SessionUser } from "@/types";
import { connectDB } from "@/lib/db/connect";
import UserModel from "@/lib/db/models/User";

const SESSION_COOKIE = "debales_session";

/** Get the session user from server-side cookies (for Route Handlers & Server Components) */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!userId) return null;

    await connectDB();
    const user = await UserModel.findById(userId).lean();
    if (!user) return null;

    return {
      id: (user._id as { toString(): string }).toString(),
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
    };
  } catch {
    return null;
  }
}

/** Get the session user from a request (for middleware) */
export async function getSessionUserFromRequest(
  req: NextRequest
): Promise<SessionUser | null> {
  try {
    const userId = req.cookies.get(SESSION_COOKIE)?.value;
    if (!userId) return null;

    await connectDB();
    const user = await UserModel.findById(userId).lean();
    if (!user) return null;

    return {
      id: (user._id as { toString(): string }).toString(),
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
    };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
