import { clerkMiddleware } from '@clerk/nextjs/server'

// This only makes Clerk's auth() context available to routes - it does NOT
// call .protect() and therefore does not enforce authentication on
// anything by itself (intentional: education/catalog routes are public).
// Every route that takes a userId must check ownership itself - see
// lib/require-owner.ts's checkOwnership(), used by app/api/users/[userId],
// app/api/products/[category], and the app/api/[...path] backend proxy.
export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
