import { Form, type MetaFunction } from "@remix-run/react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const meta: MetaFunction = () => {
  return [
    { title: "Login" },
    { name: "description", content: "Login to Remix Notes App" },
  ];
};

export default function Login() {
    const [seePassword, setSeePassword] = useState(false);

    console.log(seePassword)

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
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <div className=" relative">
                                <Input
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    type={seePassword ? "text" : "password"}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2/4 translate-y-[-50%]"
                                    onClick={() => setSeePassword(!seePassword)}
                                >
                                    {
                                        seePassword
                                            ? <Eye />
                                            : <EyeOff />
                                    }
                                </button>
                            </div>

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
                    <CardFooter>
                        <Button className="w-full">Login</Button>
                    </CardFooter>
                </Card>
            </Form>
        </div>
    )
}
