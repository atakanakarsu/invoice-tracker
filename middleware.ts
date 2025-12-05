import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // Authorization logic
        // if (path.startsWith("/admin") && token?.role !== "ADMIN") {
        //   return NextResponse.redirect(new URL("/unauthorized", req.url))
        // }

        // Allow all authenticated users for now, specific page protection can be done in Layouts or per-page.
        // However, requiring "ADMIN" for /admin is good practice here.

        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url)) // Redirect to home or unauthorized
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: ["/admin/:path*", "/accounting/:path*", "/operation/:path*", "/dashboard/:path*"],
}
