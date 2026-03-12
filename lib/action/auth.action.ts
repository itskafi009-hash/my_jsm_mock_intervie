'use server';

import {error} from "next/dist/build/output/log";
import {db, auth} from "@/firebase/admin";
import {cookies} from "next/headers";
import {firestore} from "firebase-admin";
import DocumentReference = firestore.DocumentReference;
import {doc} from "@firebase/firestore";

const ONE_WEEK= 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
    const {uid, name, email} = params;

    try {

        const userRecord=await db.collection('users').doc(uid).get();

        if(userRecord.exists) {
            return{
                success: false,
                message:'User already exists. Please sign in instead.'
            }
        }
        await db.collection('users').doc(uid).set({
            name, email
        })
        return{
            success: true,
            message: 'Account created successfully.Please sign in.'
        }
    } catch(e: any ) {
        console.error('Error creating a user', e)


        if(e.code === 'auth/email-already-exists') {
            return {
                success: false,
                message: 'this email is already in use.'

            }
        }
        return {
            success: false,
            message: 'Failed to create an account.'

        }
    }
}

export async function signIn(params: SignInParams) {
    const {email, idToken} = params;

    try {
        const userRecord = await auth.getUserByEmail(email);

        if(!userRecord) {
            return {
                success: false,
                message: 'User does not exist. Create an account instead.'
            }
        }
        await setSessionCookie(idToken);
    } catch(e){
            console.log(e);

            return{
                success: false,
                message:"Failed to log into an account."
            }
        }
    }


export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies()

    const sessionCookie = await auth.createSessionCookie(idToken,{
        expiresIn: ONE_WEEK * 1000,
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    })
}

export async function getCurrentUser(): Promise<User| null> {
    const cookieStore = await cookies()


    const sessionCookie = cookieStore.get('session')?.value;
    if(!sessionCookie) return null;

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

        const userRecord  = await db
            .collection('users')
            .doc(decodedClaims.uid)
            .get();

        if( !userRecord.exists) return null;

        return{
            ...userRecord.data(),
            id: userRecord.id
        }as User;

    }catch(e){
        console.log(e)

        return null;
    }

}

export async function isAuthenticated() {
    const user = await getCurrentUser();

    return !!user;

}

/*export async function getInterviewsByUserId(userId: string): Promise<Interview[]  | null> {
    const interviews = await db.collection('interviews').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }))as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[]  | null> {
    const {userId, limit = 20 } = params;


   const interviews = await db
        .collection('interviews')
        .orderBy('createdAt', 'desc')
        .where('finalized', '==', true )
        .where('userId', '!=', userId)
        .limit(limit)
        .get();
    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }))as Interview[];
}*/
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