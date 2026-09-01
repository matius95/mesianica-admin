import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserActions(userId: string): Promise<string[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              actions: {
                include: {
                  action: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || user.status !== "ACTIVO") return [];

  const actionsSet = new Set<string>();
  for (const userRole of user.roles) {
    for (const roleAction of userRole.role.actions) {
      actionsSet.add(roleAction.action.name);
    }
  }

  return Array.from(actionsSet);
}

export async function hasAction(userId: string, actionName: string): Promise<boolean> {
  const userActions = await getUserActions(userId);
  return userActions.includes(actionName);
}
