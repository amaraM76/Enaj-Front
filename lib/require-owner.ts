import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Resolves whether the currently signed-in Clerk user is allowed to act as
 * `targetUserId` (which may be either a raw Clerk id like "user_..." or our
 * internal UserProfile UUID). Returns null when authorized, or a short
 * { status, error } payload the caller should respond with when not -
 * this is the one check standing between a guessed/known user id and a
 * stranger's health data, so every route that takes a userId (query param
 * or JSON body) must call this before touching the database or the backend.
 */
export async function checkOwnership(
  targetUserId: string | null | undefined
): Promise<{ status: 401 | 403; error: string } | null> {
  if (!targetUserId) return null

  const { userId: sessionClerkId } = await auth()
  if (!sessionClerkId) {
    return { status: 401, error: 'Unauthorized' }
  }

  const ownerClerkId = targetUserId.startsWith('user_')
    ? targetUserId
    : (
        await prisma.userAuth.findUnique({
          where: { userId: targetUserId },
          select: { clerkId: true },
        })
      )?.clerkId ?? null

  if (ownerClerkId !== sessionClerkId) {
    return { status: 403, error: 'Forbidden' }
  }

  return null
}
