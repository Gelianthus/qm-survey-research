import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongoose/mongooseConnection";
import { Submission } from "@/lib/mongoose/models/Submission";

export async function GET() {
    await connectMongoDB();
    const submissions = await Submission.find();
    return NextResponse.json(submissions);
}