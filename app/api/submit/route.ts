import { connectMongoDB } from "@/lib/mongoose/mongooseConnection";
import { Submission } from "@/lib/mongoose/models/Submission";
import { NextRequest } from "next/server";
import { z } from "zod";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const ipRequestMap = new Map<string, { count: number; windowStart: number }>();

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


export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { success: false, message: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 50_000) {
    return Response.json(
      { success: false, message: "Request body too large." },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, message: "Malformed JSON." }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, message: parsed.error.issues[0].message },
      { status: 422 }
    );
  }

  try {
    await connectMongoDB();
    const submission = await Submission.create(parsed.data);
    return Response.json({ success: true, data: submission });
  } catch (error) {
    console.error("Submission error:", error);
    return Response.json(
      { success: false, message: "Failed to save submission." },
      { status: 500 }
    );
  }
}


