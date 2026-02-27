import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId query parameter is required" } satisfies ApiError,
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("responses")
    .select("*, answers(*)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message } satisfies ApiError,
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const supabase = createServerClient();

  // If submitting an answer to an existing response
  if ("answer" in body) {
    const { answer } = body;
    const { data, error } = await supabase
      .from("answers")
      .insert(answer)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message } satisfies ApiError,
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  }

  // Creating a new response
  if (!body.project_id || !body.respondent_id) {
    return NextResponse.json(
      {
        error: "project_id and respondent_id are required",
      } satisfies ApiError,
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("responses")
    .insert({
      project_id: body.project_id,
      respondent_id: body.respondent_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message } satisfies ApiError,
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
