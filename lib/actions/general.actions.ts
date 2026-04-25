"use server";
import {db} from "@/firebase/admin";
import {generateObject, generateText} from "ai";
import {google} from "@ai-sdk/google";
import {feedbackSchema} from "@/constants";
import {FieldValue} from "firebase-admin/firestore";


export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {

    const interviews = await db
        .collection('interviews')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return interviews.docs.map(doc => ({id: doc.id, ...doc.data()})) as Interview[];
  // createdAt: data.createdAt?.toMillis(),

}
export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    try {
        const interviews = await db
            .collection('interviews')
            .where('finalized', '==', true)
            .where('userId', 'not-in', [userId])
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        return interviews.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Interview[];
    } catch (error: any) {
        console.error("Error fetching latest interviews:", error.message);
        return null;
    }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
       if (!id) {
           console.error("Interview ID missing")
           return null;
       }

        const interview = await db
            .collection('interviews')
            .doc(id)
            .get();
        if(!interview.exists) {
            return null;
        }
        return {
            id: interview.id,
          ...(interview.data() as Omit<Interview,
              "id">)
        };
}

export async function createFeedback(params: CreateFeedbackParams) {
    const {interviewId, userId, transcript, role } = params;
    if(!interviewId) {
        console.log("interviewId missing")
        return { success: false };
    }

    try {
        if(!transcript || transcript.length === 0) {
            console.log("Transcript empty");
            return{ success: false };
        }
        console.log("Transcript: ", transcript);
        const formattedTranscript = transcript
            .map((sentence: {role: string; content: string}) => (
                `-${sentence.role}: ${sentence.content}\n`
            )).join('');
        const result = await  generateObject({
            model: google('gemini-3-flash-preview'),
            schema: feedbackSchema,
            prompt:` 
            You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be through and detailed in you analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
            Transcript:
            ${formattedTranscript}
            
            Please score the candidate from 0 to 100 in the following areas. Do not add categories rather than the once provided.
            - **Communication skills**: Clarity, articulation, structured responses.
            - **Technical Knowledge**: Understanding of key concepts for the role.
            - **Problem-solving**: Ability to analyze problems and propose solutions.
            - **Cultural & Role Fit**: Alignment with company values amd job role.
            - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
            Return response strictly in JSON format matching the schema.
            Do not include any explanation, text, or markdown.
            `,
            system:
                "You are a professional interviewer analyzing a mock interview.Your task is to evaluate the candidate based on structured categories",
        });
        const feedbackData = result?.object;
        console.log("AI RAW RESPONSE;", result);
        if (!feedbackData) {
            console.log("AI respond failed");
            return {success: false};
        }
        const{
            totalScore,
            categoryScores,
            strengths,
            areasForImprovement,
            finalAssessment,
        } = feedbackData;

         const feedback = await db.collection('feedback').add({
             interviewId,
             userId,
             totalScore,
             strengths,
             areasForImprovement,
             finalAssessment,
             categoryScores,
             createdAt: FieldValue.serverTimestamp(),
         })
        await
            db.collection('interviews').doc(interviewId).set({
                completed: true,
                feedbackGenerated: true,
                role: role,
                transcript: formattedTranscript,
                finalized: true,
            }, { merge: true });
        return {
             success: true,
             feedbackId: feedback.id

        }


    }catch(e: any) {
        console.error("FULL ERROR:", e?.message || e);
        return  { success: false }
    }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback| null> {
    const { interviewId, userId} = params;

    try {
        const feedback = await db
            .collection('feedback')
            .where('interviewId', '==', interviewId)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if(feedback.empty) return null;

        const feedbackDoc = feedback.docs[0];
        return {
            id: feedbackDoc.id, ...feedbackDoc.data()
        } as Feedback;


    } catch (error: any) {
        console.error("Error fetching latest interviews:", error.message);
        return null;
    }
}

export async function updateInterviewRole(interviewId: string, role: string) {
    await db.collection("interviews").doc(interviewId).update({
        role,
    });
}

/*export async function getUserInterviewScores(userId: string) {
    const snapshot = await db
        .collection("feedback")
        .where("userId", "==", userId)
        .orderBy("createdAt", "asc")
        .get();

    const data = snapshot.docs.map((doc) => doc.data());

    return data.map((item) => ({
        date: item.createdAt,
        score: item.totalScore || 0,
    }));
}*/
/*export async function getUserInterviewScores(userId: string) {
    const snapshot = await db
        .collection("feedback")
        .where("userId", "==", userId)
        .orderBy("createdAt", "asc")
        .get();

    return snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            date: data.createdAt?.toMillis(), // ✅ FIX (best for charts)
            score: data.totalScore || 0,
        };
    });
}*/
export async function getUserInterviewScores(userId: string) {
    const snapshot = await db
        .collection("feedback")
        .where("userId", "==", userId)
        .orderBy("createdAt", "asc")
        .get();

    return snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            date: data.createdAt ? data.createdAt.toMillis() : 0, // ✅ FIX
            score: data.totalScore || 0,
        };
    });
}




export async function detectRoleFromTranscript(messages: any[]) {
    try {
        const fullText = messages
            .map((m) => m.content)
            .join(" ")
            .toLowerCase();

        console.log("FULL TEXT:", fullText);

        // ✅ STEP 1: Strong regex patterns
        const patterns = [
            /i am a ([a-zA-Z ]+)/,
            /i am an ([a-zA-Z ]+)/,
            /i'm a ([a-zA-Z ]+)/,
            /i'm an ([a-zA-Z ]+)/,
            /i work as a ([a-zA-Z ]+)/,
            /my role is ([a-zA-Z ]+)/,
        ];

        let detectedRole = "";

        for (const pattern of patterns) {
            const match = fullText.match(pattern);
            if (match && match[1]) {
                detectedRole = match[1].trim();
                break;
            }
        }

        // ✅ STEP 2: Clean role (IMPORTANT FIX 🔥)
        if (detectedRole) {
            const cleaned = detectedRole
                .split(" ")
                .filter(word =>
                    !["so", "and", "but", "also", "just"].includes(word)
                )
                .slice(0, 3) // max 3 words only
                .join(" ");

            console.log("CLEANED ROLE:", cleaned);

            if (cleaned.length > 0) {
                return capitalizeRole(cleaned);
            }
        }

        // ✅ STEP 3: fallback AI
        const result = await generateText({
            model: google("gemini-1.5-flash"),
            prompt: `
Extract the job role from this conversation.

Rules:
- Only return job role (1-3 words)
- No explanation
- Examples: Teacher, Doctor, Software Engineer

Conversation:
${fullText}
            `,
        });

        const aiRole = result.text.trim();

        if (aiRole && aiRole.length < 50) {
            return capitalizeRole(aiRole);
        }

        return "General Interview";

    } catch (error) {
        console.log("ROLE DETECT ERROR:", error);
        return "General Interview";
    }
}

// ✅ helper function
function capitalizeRole(role: string) {
    return role
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}