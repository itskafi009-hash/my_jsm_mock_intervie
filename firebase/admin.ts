import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const initFirebaseAdmin = () => {
    if (!getApps().length) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!privateKey) {
            throw new Error("FIREBASE_PRIVATE_KEY is missing");
        }
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID!,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
               // privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
                privateKey: privateKey.replace(/\\n/g, "\n"),
            }),
        });
    }

    return {
        auth: getAuth(),
        db: getFirestore(),
    };
};

const { auth, db } = initFirebaseAdmin();

export { auth, db };