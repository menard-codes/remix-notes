import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/sessions";

export async function action({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    // TODO: Better verify the session and jwt first before log out
    return redirect("/login", {
        headers: {
            "Set-Cookie": await destroySession(session)
        }
    });
}
