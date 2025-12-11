import { NextResponse } from "next/server";

/**
 * POST /api/claim-credit-reward
 *
 * ส่งข้อมูลการแลกรางวัล credit ไปยัง External API
 *
 * Request Body:
 * {
 *   "log_id": "674f1234567890abcdef1234",
 *   "user_id": "U1234567890abcdef",
 *   "reward_title": "เครดิต 500 บาท",
 *   "reward": 500
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      log_id,
      user_id,
      reward_title,
      reward
    } = body;

    // Validate required fields
    if (!log_id || !user_id || !reward_title) {
      return NextResponse.json({
        message: "Missing required fields",
        type: "error"
      }, { status: 400 });
    }

    // Get External API configuration from environment
    // Note: NEXT_PUBLIC_ vars are accessible on server-side too in Next.js
    // But for security, we should use non-public vars for sensitive data
    const apiEndpoint = process.env.EXTERNAL_API_URL || process.env.NEXT_PUBLIC_BASE_API_URL;
    const apiKey = process.env.EXTERNAL_API_KEY || process.env.NEXT_PUBLIC_BASE_API_KEY;
    const lineAt = process.env.LINE_AT || process.env.NEXT_PUBLIC_LINE_AT;
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;

    if (!apiEndpoint || !apiKey) {
      console.error("External API configuration missing", {
        hasEndpoint: !!apiEndpoint,
        hasApiKey: !!apiKey
      });

      return NextResponse.json({
        message: "External API configuration missing",
        type: "error"
      }, { status: 500 });
    }

    if (!appUrl) {
      console.error("APP_URL configuration missing");

      return NextResponse.json({
        message: "APP_URL configuration missing",
        type: "error"
      }, { status: 500 });
    }

    // Build callback URL
    const callbackUrl = `${appUrl}/api/reward-callback`;

    // Prepare payload for External API (ตามเอกสาร REWARD_CLAIM_API_FLOW.md)
    const externalPayload = {
      log_id,
      user_id,
      mission_detail: reward_title,
      reward: reward || 0,
      callback_url: callbackUrl,
      line_at: lineAt || ''
    };

    console.log('Sending to External API:', {
      endpoint: `${apiEndpoint}/players/v1/line/rewards/claim`,
      payload: { ...externalPayload, api_key: '[HIDDEN]' }
    });

    // Send to External API
    const response = await fetch(
      `${apiEndpoint}/players/v1/line/rewards/claim`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify(externalPayload)
      }
    );

    const responseData = await response.json().catch(() => null);

    // Check response status
    if (!response.ok) {
      console.error('External API error:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      // Return success anyway because we don't want to break the user flow
      // The log is already created with pending status
      // Admin can manually handle or retry later
      return NextResponse.json({
        message: "External API request failed, but reward claim is recorded",
        type: "warning",
        log_id,
        external_status: response.status,
        external_response: responseData
      });
    }

    console.log('External API response:', responseData);

    return NextResponse.json({
      message: "Credit reward claim sent to external API",
      type: "success",
      log_id,
      callback_url: callbackUrl,
      external_response: responseData
    });

  } catch (error) {
    console.error("Error sending credit reward claim:", error);

    // Don't return error status - the points are already deducted
    // Return success with warning so the flow doesn't break
    return NextResponse.json({
      message: "Error sending to external API, but reward claim is recorded",
      type: "warning",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const dynamic = "force-dynamic";
