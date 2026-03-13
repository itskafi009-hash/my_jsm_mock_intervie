import {db} from "@/firebase/admin";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
    try {
        const interviews = await db
            .collection('interviews')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        if (interviews.empty) {
            console.log("No interviews found for user:", userId);
            return [];
        }

        return interviews.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Interview[];
    } catch (error: any) {
        console.error("Error fetching interviews by userId:", error.message);
        return null;
    }
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