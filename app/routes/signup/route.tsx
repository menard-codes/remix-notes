import type { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import PasswordInput from "~/components/PasswordInput";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const meta: MetaFunction = () => [
    { title: "Sign Up" },
    { name: "description", content: "Sign up to create an account for the Remix Notes App" }
]

export default function Signup() {
    return (
        <div>
            <h1 className=" text-center text-4xl font-semibold my-8">Sign Up</h1>
            <Form onSubmit={e => {
                const form = new FormData(e.currentTarget);
                if (form.get("password") !== form.get("confirm-password")) {
                    e.preventDefault();
                }
            }}>
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
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
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
                    <CardFooter>
                        <Button className="w-full">Sign Up</Button>
                    </CardFooter>
                </Card>
            </Form>
        </div>
    )
}
