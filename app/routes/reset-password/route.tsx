import { MetaFunction } from "@remix-run/node"

export const meta: MetaFunction = () => [
    { title: "Reset Password" },
    { name: "description", content: "Reset your password" }
];

export default function ResetPassword() {
    return (
        <div>
            <h1 className=" text-center text-4xl font-semibold my-8">Reset Password</h1>
            <p>TODO: Add a mailer</p>
        </div>
    )
}
