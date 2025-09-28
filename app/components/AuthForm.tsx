"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,

    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";
const formSchema = z.object({
    username: z.string().min(2).max(50),
});
const authFormSchema = (type: FormType) => {
    return z.object({
        name: type === 'sign-up' ? z.string().min(2).max(50) : z.string().optional(),
        email: z.email(),
        password: z.string().min(3)
    });
}
const AuthForm = ({ type }: { type: FormType }) => {
    const router =useRouter()
    const formSchema = authFormSchema(type)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            password: '',
            email: ''
        }
    });
console.log("auth",auth)
    // 2. Define a submit handler.
    const onSubmit = async(values: z.infer<typeof formSchema>)=> {
        console.log("apikey",process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY)
        try {
            if (type === 'sign-up') {
                const {name,email, password}=values;
                const userCredentials =await createUserWithEmailAndPassword(auth,email,password)
                const result = await signUp({
                    uid:userCredentials.user.uid,
                    name:name!,
                    email:email,
                    password:password,
                })
                if(!result?.success){
                    toast.error(result?.message)
                }
                toast.success('Account created succesfully')
                router.push('/sign-in')
            }
            else {
                const {email,password}=values;
                const userCredential = await signInWithEmailAndPassword(auth, email,password);
                const idToken=await userCredential.user.getIdToken();
                if(!idToken){
                    toast.error('Sign in failed')
                    return;
                }
                await signIn({
                    email, idToken
                })

                toast.success('Signed in successfully')
                router.push('/')
            }
        } catch (error) {
            console.log(error);
            toast.error(`There was an error ${error}`)
        }
    }
    const isSignIn = type == 'sign-in';
    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card p-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" height={32} width={38} />
                    <h2 className="text-primary-100">PrepWise</h2>
                </div>
                <h3>Practice job interview with AI</h3>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className=" w-full space-y-6 mt-4 form ">
                        {!isSignIn && <FormField control={form.control} name='name' label='Name' placeholder='Your Name'/>}
                       <FormField control={form.control} name='email' label='Email' placeholder='Your Email Address'/>
                        <FormField control={form.control} name='password' label='Password' placeholder='Your Password' type="password"/>
                        <Button className="btn">{isSignIn ? 'Sign in' : 'Create an account'}</Button>
                    </form>
                </Form>
                <p className="text-center">{!isSignIn ? 'Have an account already?' : 'No account yet?'}
                    <Link href={!isSignIn ? '/sign-in' : '/sign-up'} className="font-bold text-user-primary ml-1">
                        {isSignIn ? 'Sign Up' : 'Sign In'}
                    </Link></p>
            </div>
        </div>
    );
};

export default AuthForm;
