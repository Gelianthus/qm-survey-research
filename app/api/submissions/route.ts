import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { connectMongoDB } from "@/lib/mongoose/mongooseConnection";
import { Submission } from "@/lib/mongoose/models/Submission";

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const cache = {
    data: null as unknown,
    timestamp: 0,
    TTL: 60 * 1000,
};

const rateLimiter = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

function corsHeaders(origin: string | null) {
    const allowed = origin === ALLOWED_ORIGIN;
    return {
        "Access-Control-Allow-Origin": allowed ? ALLOWED_ORIGIN : "",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

function getIP(request: NextRequest): string {
    return request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
}

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimiter.get(ip);
    if (!entry || now - entry.timestamp > RATE_WINDOW) {
        rateLimiter.set(ip, { count: 1, timestamp: now });
        return false;
    }
    if (entry.count >= RATE_LIMIT) return true;
    entry.count++;
    return false;
}

export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get("origin");
    return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
    });
}

export async function GET(request: NextRequest) {
    const origin = request.headers.get("origin");
    const headers = corsHeaders(origin);

    try {
        const ip = getIP(request);
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests, slow down" },
                { status: 429, headers }
            );
        }

        const now = Date.now();
        if (cache.data && now - cache.timestamp < cache.TTL) {
            return NextResponse.json(cache.data, {
                status: 200,
                headers: { ...headers, "X-Cache": "HIT" },
            });
        }

        await connectMongoDB();

        const submissions = await Submission.find()
            .select("-__v")
            .limit(100)
            .lean();

        cache.data = submissions;
        cache.timestamp = now;

        return NextResponse.json(submissions, {
            status: 200,
            headers: { ...headers, "X-Cache": "MISS" },
        });

    } catch (error) {
        console.error("[GET /submissions]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers }
        );
    }
}