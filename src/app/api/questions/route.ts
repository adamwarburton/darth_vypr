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
    .from("questions")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

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

  if (!body.project_id || !body.title?.trim() || !body.type) {
    return NextResponse.json(
      { error: "project_id, title, and type are required" } satisfies ApiError,
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("questions")
    .insert(body)
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

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Question id is required" } satisfies ApiError,
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("questions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message } satisfies ApiError,
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "id query parameter is required" } satisfies ApiError,
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message } satisfies ApiError,
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
