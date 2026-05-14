import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

export const requireAuth = (req: any, res: any, next: any): void => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId as string;
  next();
};

export const requireAdmin = async (req: any, res: any, next: any): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId as string));
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
};

export const requireActiveSubscription = async (req: any, res: any, next: any): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId as string;
  const { subscriptionsTable } = await import("@workspace/db");
  const { eq: eqSub, and } = await import("drizzle-orm");
  const [sub] = await db.select().from(subscriptionsTable).where(
    eqSub(subscriptionsTable.userId, userId as string)
  );
  if (!sub || sub.status !== "active") {
    res.status(403).json({ error: "Active subscription required" });
    return;
  }
  next();
};

export const ensureUser = async (req: any, res: any, next: any): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) { next(); return; }
  req.userId = userId as string;
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId as string));
  if (!existing) {
    await db.insert(usersTable).values({
      clerkId: userId as string,
      email: (auth?.sessionClaims?.email as string) || "",
      name: (auth?.sessionClaims?.name as string) || (auth?.sessionClaims?.firstName as string) || "",
    }).onConflictDoNothing();
  }
  next();
};

export default router;
