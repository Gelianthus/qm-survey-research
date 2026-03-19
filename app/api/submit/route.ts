import { connectMongoDB } from "@/lib/mongoose/mongooseConnection";
import { Submission } from "@/lib/mongoose/models/Submission";
import { NextRequest } from "next/server";
import { z } from "zod";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const ipRequestMap = new Map<string, { count: number; windowStart: number }>();

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function corsHeaders(origin: string | null) {
  const allowed = origin === ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed ? ALLOWED_ORIGIN : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequestMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return true;
  entry.count++;
  return false;
}

const responseSchema = z.object({
  rating: z.number().int().min(1).max(5),
  used: z.enum(["yes", "no"]),
  example: z.string().max(500).trim().optional().default(""),
});

const submissionSchema = z.object({
  student_name: z.string().max(100).trim().optional().nullable(),
  college_program: z.string().min(1).max(150).trim(),
  school: z.string().min(1).max(150).trim(),
  responses: z.record(z.string(), responseSchema),
});

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { success: false, message: "Too many requests. Please wait a moment." },
      { status: 429, headers }
    );
  }

  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 50_000) {
    return Response.json(
      { success: false, message: "Request body too large." },
      { status: 413, headers }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, message: "Malformed JSON." },
      { status: 400, headers }
    );
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, message: parsed.error.issues[0].message },
      { status: 422, headers }
    );
  }

  try {
    await connectMongoDB();
    const submission = await Submission.create(parsed.data);
    return Response.json(
      { success: true, data: submission },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Submission error:", error);
    return Response.json(
      { success: false, message: "Failed to save submission." },
      { status: 500, headers }
    );
  }
}
