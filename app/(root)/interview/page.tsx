import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { db } from "@/firebase/admin";
import {FieldValue} from "firebase-admin/firestore";

const Page = async () => {
    const user = await getCurrentUser();

    if (!user) return null;

    // ✅ ALWAYS CREATE NEW INTERVIEW
    const docRef = await db.collection("interviews").add({
        userId: user.id,
        role: "Generating...",
        type: "generate",
        techstack: [],
        questions: [],
        createdAt: FieldValue.serverTimestamp(),
        completed: false,
    });

    const interviewId = docRef.id;

    return (
        <>
            <h3>Interview generation</h3>

            <Agent
                userName={user.name}
                userId={user.id}
                interviewId={interviewId}
                type="generate"
            />
        </>
    );
};
export default Page;