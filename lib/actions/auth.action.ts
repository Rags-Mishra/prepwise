/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { auth } from "@/firebase/admin";
import { db } from "@/firebase/admin";
import { cookies } from "next/headers";
const ONE_WEEK=60*60*24*7*1000;
export async function setSessionCookie(idToken:string){
    const cookieStore=await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken,{
        expiresIn:ONE_WEEK,
    })
    cookieStore.set('session',sessionCookie,{
        maxAge:ONE_WEEK,
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        path:'/',
        sameSite:'lax'
    })
}
export async function signUp(params:SignUpParams){
    const {uid, name, email}=params;
    try {
        const userRecord  =await db.collection('users').doc(uid).get();
        if(userRecord.exists){
            return {
                success:false,
                message:'User exists. Please sign in'
            }
        }
        db.collection('users').doc(uid).set({
            name,email
        })
        return {
            success:false,
            message:'Account created successfully. Please sign in.'
        }
    } catch (error:any) {
        console.error('ERROR creating a user', error)
        if(error.code==='auth/email-already-exists'){
            return{
                success:false,
                message:'This email is already in use.'
            }
        }
        return{
         success:false,
         message:'Failed to create a user'
        }
    }
}
export async function signIn(params:SignInParams){
    const {email, idToken}=params;

    try {
        const userRecord=await auth.getUserByEmail(email);
        if(!userRecord){
            return{
                success:false,
                message:'User not found. Create an account instead.'
            }
        }
        await setSessionCookie(idToken);
    } catch (error) {
        console.log(error)
        return{
            success:false,
            message:'Failed to log into an account.'
        }
    }
}
export async function getCurrentUser():Promise<User|null>{
    const cookieStore=await cookies();
    const sessionCookie=cookieStore.get('session')?.value;
    if(!sessionCookie) return null;
    try {
        const decodedCookie=await auth.verifySessionCookie(sessionCookie,true);
        const userRecord =await db.collection('users').doc(decodedCookie.uid).get();
        if(!userRecord.exists){

return null;
        }
        return {
            ...userRecord.data(),
            id:userRecord.id
        }as User
    } catch (error) {
        console.error(error)
        return null;
    }

}
export async function isAuthenticated(){
    const user=await getCurrentUser();
    return !!user;
}
export async function getLatestInterviews(params:GetLatestInterviewsParams) :Promise<Interview[]|null>{
    const {userId,limit=20}=params
const interviews=await db.collection('interviews').where('finalized','==',true).where('userd','!=',userId).limit(limit).orderBy('createdAt','desc').get()
    return interviews.docs.map((doc)=>({
        id:doc.id,
        ...doc.data()
    }))as Interview[]
}

export async function getInterviewsByUserId(userId:string) :Promise<Interview[]|null>{
const interviews=await db.collection('interviews').where('userId','==',userId).orderBy('createdAt','desc').get()
    return interviews.docs.map((doc)=>({
        id:doc.id,
        ...doc.data()
    }))as Interview[]
}