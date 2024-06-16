import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

// remix imports and other utils
import { Form, Link, redirect, useNavigation } from "@remix-run/react";
import { commitSession, getSession } from "~/sessions";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { db } from "~/db/db.server";
import { checkIfAuthorizedAlready } from "~/utils/auth.server";

// components (custom and installed/3rd-party) and icons
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import PasswordInput from "~/components/utils/PasswordInput";
import { ClipboardPen, KeyRound, LoaderCircle } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Login" },
    { name: "description", content: "Login to Remix Notes App" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
    dotenv.config();

    const formData = await request.formData();
    const requiredFields = ["username-or-email", "password"];
    const hasAllRequired = requiredFields.every(required => Array.from(formData.keys()).includes(required));
    if (!hasAllRequired) {
        // TODO: handle this route guard later
        console.log('This should be an error');
        return null;
    }

    try {
        const usernameOrEmail = formData.get("username-or-email") as string;
        const password = formData.get("password") as string;
        const user = await db.users.findFirst({ where: {
            OR: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        } });
        if (!user) {
            // TODO: This should be an error. handle later;
            console.log('user doesn\'t exist. check the login credentials or create an account', usernameOrEmail, password);
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
    return await checkIfAuthorizedAlready(request);
}

export default function Login() {
    const nav = useNavigation();

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
                            <Label htmlFor="username-or-email">Username or Email</Label>
                            <Input
                                id="username-or-email"
                                name="username-or-email"
                                placeholder="Enter your username or email"
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
                        <Button className="w-full" disabled={nav.state === "loading" || nav.state === "submitting"}>
                            {
                                (nav.state === "submitting" || nav.state === "loading") && nav.formAction === "/login"
                                    ? <LoaderCircle className="animate-spin" />
                                    : (
                                        <>
                                            <KeyRound className="mr-2" size="1.2rem" />
                                            Login
                                        </>
                                    )
                            }
                        </Button>

                        <div className="relative my-6">
                            <hr className="absolute top-2/4 w-full" />
                            <p className="absolute top-2/4 translate-y-[-50%] left-0 right-0 m-auto w-fit bg-white px-2">or</p>
                        </div>

                        <Link to="/signup" className={buttonVariants({ variant: "secondary" })}>
                            <ClipboardPen size="1.2rem" className="mr-2" />
                            Sign Up Instead
                        </Link>
                    </CardFooter>
                </Card>
            </Form>
        </div>
    )
}
