import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
    return Response.json({ success: true, data: "Thank You!" }, { status: 200 });
}

export async function POST(request: Request) {
    console.log("POST API HIT");

    const { type, role, level, techstack, amount, userId } = await request.json();

    try {
        const result = await generateText({
            model: google("gemini-3-flash-preview"), // ✅ fixed model
            /*prompt: `Prepare question for a job interview.
Role: ${role}
Level: ${level}
Tech stack: ${techstack}
Type: ${type}
Number: ${amount}

Return ONLY JSON:
["Question 1", "Question 2"]`*/
            prompt: `Generate exactly ${amount} interview questions.

Role: ${role}
Level: ${level}
Tech stack: ${techstack}
Type: ${type}

STRICT RULES:
- Return ONLY JSON array
- No explanation
- No markdown
- No extra text

Example:
["Q1", "Q2", "Q3"]`
        });

        const questions = result.text;

        // ✅ CORRECT PLACE
        console.log("Gemini raw output:", questions);

        // ✅ SAFE PARSE
        /*let parsedQuestions = [];

        try {
            parsedQuestions = JSON.parse(questions);
        } catch (e) {
            console.log("JSON parse failed:", questions);
        }*/

        let parsedQuestions: string[] = []; // ✅ ADD THIS

        let cleaned = questions.replace(/```json|```/g, "").trim();

        try {
            parsedQuestions = JSON.parse(cleaned);
        } catch (e) {
            console.log("JSON parse failed:", cleaned);
        }

        const interview = {
            role,
            type,
            level,
            techstack: techstack.split(","), // ✅ fixed
            questions: parsedQuestions,
            userId,
            finalized: true,
            coverImage: getRandomInterviewCover(role),
            createdAt: FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection("interviews").add(interview);

        return Response.json({
            success: true,
            interviewId: docRef.id
        });

    } /*catch (error) {
        console.error(error);

        return Response.json({ success: false, error }, { status: 500 });
    }*/
    catch (error: any) {
        console.error("FULL ERROR:", error);

        return Response.json({
            success: false,
            error: error?.message || JSON.stringify(error, null, 2)
        }, { status: 500 });
    }
}