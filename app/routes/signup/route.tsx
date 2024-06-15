import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, redirect } from "@remix-run/react";
import PasswordInput from "~/components/PasswordInput";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "~/db/db.server";
import { commitSession, getSession } from "~/sessions";

import dotenv from "dotenv";

export const meta: MetaFunction = () => [
    { title: "Sign Up" },
    { name: "description", content: "Sign up to create an account for the Remix Notes App" }
]

export async function loader({ request }: LoaderFunctionArgs) {
    dotenv.config();

    const session = await getSession(request.headers.get("Cookie"));
    
    // check if jwt is already in the cookie and check if it is valid
    if (session.has("jwt")) {

        // ----
        // validate jwt
        const token = session.get("jwt") as string;
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            // TODO: this should be an error
            console.log('Error: jwtSecret cannot be retrieved from env');
            return null;
        }
        try {
            const decoded = jwt.verify(token, jwtSecret);
            if (typeof decoded === "string") {
                // TODO: this should be an error
                console.log('invalid or expired token');
                return null;
            }
            // check if the user with that id exists
            const user = await db.users.findFirst({ where: { id: decoded.userId } });
            if (!user) {
                // TODO: This should be an error
                console.log(`user with id ${decoded.userId} does not exist`);
                return null;
            }
            // if all tests passed, redirect to homepage
            return redirect("/");
            // -----
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return null;
            }

            console.log('error....');
            console.error(error);
            return null;
        }
    }

    return null;
}

export async function action({ request }: ActionFunctionArgs) {
    dotenv.config();

    const formData = await request.formData();
    const requiredFields = ["email", "username", "password", "confirm-password"];
    const hasAllRequired = requiredFields.every(required => Array.from(formData.keys()).includes(required))
    if (!hasAllRequired) {
        // TODO: handle this route guard later
        console.log('This should be an error')
        return null;
    }

    try {
        const formObject = Object.fromEntries(formData);
        const user = await db.users.findFirst({ where: { OR: [
            { username: formObject.username as string },
            { email: formObject.email as string }
        ] } });
        if (user !== null) {
            // TODO: Handle proper error for existing user
            console.log('user already exists')
            return null;
        }
        const hashedPassword = await bcrypt.hash(formObject.password as string, 10);
        await db.users.create({ data: {
                email: formObject.email as string,
                username: formObject.username as string,
                hashedPassword,
        }});
        
        return redirect("/login")
    } catch (error) {
        // TODO: handle this error
        console.log('got an error...');
        console.error(error);
        return null;
    }
}

export default function Signup() {
    return (
        <div>
            <h1 className=" text-center text-4xl font-semibold my-8">Sign Up</h1>
            <Form
                method="POST"
                onSubmit={e => {
                    const form = new FormData(e.currentTarget);
                    if (form.get("password") !== form.get("confirm-password")) {
                        e.preventDefault();
                    }
                }}
            >
                <Card className=" max-w-[720px] mx-auto">
                    <CardHeader>
                        <CardTitle>Remix Notes</CardTitle>
                        <CardDescription>Sign up to create an account for the Remix Notes App</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter Email"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="Enter Username"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Enter Password"
                                required={true}
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <PasswordInput
                                id="confirm-password"
                                name="confirm-password"
                                placeholder="Confirm Password"
                                required={true} 
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="grid">
                        <Button className="w-full">Sign Up</Button>

                        <div className="relative my-6">
                            <hr className="absolute top-2/4 w-full" />
                            <p className="absolute top-2/4 translate-y-[-50%] left-0 right-0 m-auto w-fit bg-white px-2">or</p>
                        </div>

                        <Link to="/login" className={buttonVariants({ variant: "secondary" })}>Log In Instead</Link>
                    </CardFooter>
                </Card>
            </Form>
        </div>
    )
}
