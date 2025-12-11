// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.warn('========= START MIDDLEWARE =========');
  console.warn('Request URL:', request.url);
  console.warn('Referer:', request.headers.get('referer'));
  console.warn('Origin:', request.headers.get('origin'));

  // ตรวจสอบ token จาก URL
  const urlToken = request.nextUrl.searchParams.get('token');
  const cookieToken = request.cookies.get('ruaysud-backoffice-access-token');
  const refreshToken = request.cookies.get('ruaysud-backoffice-refresh-token');

  // ถ้ามี token ใน URL
  if (urlToken) {
    console.warn('Found token in URL, validating...');

    try {
      // ขอ access token จาก refresh token
      const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/v1/refresh`, {
        method: "POST",
        headers: {
          "API-KEY": process.env.NEXT_PUBLIC_BASE_API_KEY as string,
          "Authorization": `Bearer ${urlToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "refresh_token": urlToken
        })
      });

      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok && refreshData.access_token) {
        // validate access token
        const validateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/v1/validate/token`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${refreshData.access_token}`,
            "API-KEY": process.env.NEXT_PUBLIC_BASE_API_KEY as string
          }
        });

        if (validateResponse.ok) {
          const validateResult = await validateResponse.json();

          if (validateResult.isValid) {
            // ใช้ NEXT_PUBLIC_APP_URL สำหรับ redirect
            const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL);
            const response = NextResponse.redirect(redirectUrl);

            // Set cookies with cross-site settings
            response.cookies.set('ruaysud-backoffice-access-token', refreshData.access_token, {
              httpOnly: true,
              secure: true,
              sameSite: 'none',
              maxAge: 6 * 60 * 60,
              path: '/',
              domain: new URL(process.env.NEXT_PUBLIC_APP_URL as string).hostname
            });

            response.cookies.set('ruaysud-backoffice-refresh-token', urlToken, {
              httpOnly: true,
              secure: true,
              sameSite: 'none',
              maxAge: 7 * 24 * 60 * 60,
              path: '/',
              domain: new URL(process.env.NEXT_PUBLIC_APP_URL as string).hostname
            });

            return response;
          }
        }
      }

      return NextResponse.redirect(process.env.NEXT_PUBLIC_ADMIN_AFF_URL as string);

    } catch (error) {
      console.error('Token processing error:', error);
      console.error('Request headers:', Object.fromEntries(request.headers.entries()));

      return NextResponse.redirect(process.env.NEXT_PUBLIC_ADMIN_AFF_URL as string);
    }
  }

  // ถ้ามี token ใน cookie
  if (cookieToken) {
    console.warn('Validating access token from cookie...');

    try {
      const validateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/v1/validate/token`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cookieToken.value}`,
          "API-KEY": process.env.NEXT_PUBLIC_BASE_API_KEY as string
        }
      });

      if (!validateResponse.ok && refreshToken) {
        console.warn('Access token expired, trying to refresh...');

        const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/v1/refresh`, {
          method: "POST",
          headers: {
            "API-KEY": process.env.NEXT_PUBLIC_BASE_API_KEY as string,
            "Authorization": `Bearer ${refreshToken.value}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "refresh_token": refreshToken.value
          })
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const response = NextResponse.next();

          response.cookies.set('ruaysud-backoffice-access-token', refreshData.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 6 * 60 * 60,
            path: '/',
            domain: new URL(process.env.NEXT_PUBLIC_APP_URL as string).hostname
          });

          return response;
        }
      }

      return validateResponse.ok ? NextResponse.next() : NextResponse.redirect(process.env.NEXT_PUBLIC_ADMIN_AFF_URL as string);
    } catch (error) {
      console.error('Token validation error:', error);

      return NextResponse.redirect(process.env.NEXT_PUBLIC_ADMIN_AFF_URL as string);
    }
  }

  // ถ้าไม่มี token ทั้งใน URL และ cookie
  console.warn('No tokens found - redirecting to login');

  return NextResponse.redirect(process.env.NEXT_PUBLIC_ADMIN_AFF_URL as string);
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*'
  ]
}
