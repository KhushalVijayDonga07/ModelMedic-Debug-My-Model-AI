import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/diagnose(.*)",
  "/billing(.*)",
  "/api/diagnoses(.*)",
  "/api/razorpay(.*)",
  "/api/diagnose(.*)",
  "/api/chat(.*)"
]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\..*).*)", "/(api|trpc)(.*)"]
};
