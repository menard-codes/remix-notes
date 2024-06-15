import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, redirect } from "@remix-run/react";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import PasswordInput from "~/components/PasswordInput";
import { commitSession, getSession } from "~/sessions";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import dotenv from "dotenv";
import { db } from "~/db/db.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Login" },
    { name: "description", content: "Login to Remix Notes App" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
    dotenv.config();

    const formData = await request.formData();
    const requiredFields = ["username", "password"];
    const hasAllRequired = requiredFields.every(required => Array.from(formData.keys()).includes(required));
    if (!hasAllRequired) {
        // TODO: handle this route guard later
        console.log('This should be an error');
        return null;
    }

    try {
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const user = await db.users.findFirst({ where: { username } });
        if (!user) {
            // TODO: This should be an error. handle later;
            console.log('user doesn\'t exist. check the login credentials or create an account', username, password);
            return null;
        }
        const isCorrectPassword = await bcrypt.compare(password, user?.hashedPassword as string);
        if (!isCorrectPassword) {
            // TODO: This should be an error. handle later
            console.log('incorrect password', password);
            return null;
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            // TODO: Handle this error
            console.log('Cannot load the jwtSecret from env');
            return null;
        }
        const token = jwt.sign({ userId: user.id }, jwtSecret, {
            expiresIn: '1h'
        });
        const session = await getSession(request.headers.get("Cookies"));
        session.set("jwt", token);
        return redirect("/", {
            headers: {
                "Set-Cookie": await commitSession(session)
            }
        })
    } catch (error) {
        // TODO: Set an error
        console.log('Error...');
        console.error(error);
        return null;
    }
}

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

export default function Login() {
    return (
        <div>
            <h1 className=" text-center text-4xl font-semibold my-8">Login</h1>
            <Form method="POST">
                <Card className=" max-w-[720px] mx-auto">
                    <CardHeader>
                        <CardTitle>Remix Notes</CardTitle>
                        <CardDescription>Enter your username and password to login</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="delete"
                                name="password"
                                placeholder="Enter your password"
                                required={true}
                            />

                            <a href="/reset-password" className="block w-fit mt-2 text-sky-600 hover:underline underline-offset-2">Forgot your password?</a>
                        </div>
                        <hr className=" my-4" />
                        <div className="flex items-center gap-2 mt-4">
                            <Checkbox
                                id="remember-me"
                            />
                            <Label htmlFor="remember-me" className=" cursor-pointer">
                                Remember Me
                            </Label>
                        </div>
                    </CardContent>
                    <CardFooter className="grid">
                        <Button className="w-full">Login</Button>

                        <div className="relative my-6">
                            <hr className="absolute top-2/4 w-full" />
                            <p className="absolute top-2/4 translate-y-[-50%] left-0 right-0 m-auto w-fit bg-white px-2">or</p>
                        </div>

                        <Link to="/signup" className={buttonVariants({ variant: "secondary" })}>Sign Up Instead</Link>
                    </CardFooter>
                </Card>
            </Form>
        </div>
    )
}
