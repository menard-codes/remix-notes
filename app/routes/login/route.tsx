import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

// remix imports and other utils
import { Form, Link, redirect, useActionData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
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
import { AlertCircle, ClipboardPen, KeyRound, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

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
    const hasAllRequired = requiredFields.every(required => (
        Array.from(formData.keys()).includes(required)
        &&
        formData.get(required)?.toString().length as number > 0
    ));
    if (!hasAllRequired) {
        return json({ error: "Username/Email and Password required" });
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
            return json({ error: `User "${usernameOrEmail}" doesn't exist. Check again the login credentials or create an account` });
        }
        const isCorrectPassword = await bcrypt.compare(password, user?.hashedPassword as string);
        if (!isCorrectPassword) {
            return json({ error: 'incorrect password' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("Can't load the JWT secret from env");
            return json({ error: 'Internal server error' }, { status: 500 });
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
        console.error(error);
        throw error;
    }
}

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        return await checkIfAuthorizedAlready(request);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export default function Login() {
    const nav = useNavigation();
    const actionData = useActionData<typeof action>();

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
                                required
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
                        {
                            actionData?.error
                                ? (
                                    <Alert variant="destructive" className="mt-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>
                                            {actionData.error}
                                        </AlertDescription>
                                    </Alert>
                                ) : ""
                        }
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

export function ErrorBoundary() {
    return (
        <div className="text-center min-h-screen grid place-content-center gap-2">
            <h1 className="text-4xl">Error</h1>
            <p>Check the logs</p>
        </div>
    )
}
