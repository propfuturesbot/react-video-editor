import { NextRequest, NextResponse } from "next/server";

const COURSEFORGE_API = process.env.COURSEFORGE_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("Authorization");

    // Forward render request to CourseForge backend
    const response = await fetch(`${COURSEFORGE_API}/api/v1/videos/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        scenes: body.scenes,
        projectId: body.projectId,
        timeline: body.timeline,
        trackItemsMap: body.trackItemsMap,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData?.message || "Failed to start render" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const authHeader = request.headers.get("Authorization");

    if (!id) {
      return NextResponse.json(
        { message: "id parameter is required" },
        { status: 400 }
      );
    }

    // Check render status from CourseForge backend
    const response = await fetch(
      `${COURSEFORGE_API}/api/v1/videos/jobs/${id}/status`,
      {
        headers: {
          ...(authHeader && { Authorization: authHeader }),
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData?.message || "Failed to get render status" },
        { status: response.status }
      );
    }

    const statusData = await response.json();
    return NextResponse.json(statusData, { status: 200 });
  } catch (error) {
    console.error("Render status error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
