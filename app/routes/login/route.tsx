import type { MetaFunction } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import PasswordInput from "~/components/PasswordInput";

export const meta: MetaFunction = () => {
  return [
    { title: "Login" },
    { name: "description", content: "Login to Remix Notes App" },
  ];
};

export default function Login() {

    return (
        <div>
            <h1 className=" text-center text-4xl font-semibold my-8">Login</h1>
            <Form>
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
                                placeholder="Enter password"
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
