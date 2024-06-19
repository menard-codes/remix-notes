import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

// remix imports and other utils
import { Form, json, redirect, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { checkAuthentication } from "~/utils/auth.server";
import jwt from "jsonwebtoken";

// components (custom and installed/3rd-party) and icons
import NoteItem from "./NoteItem";
import { LogOutLoader } from "~/components/utils/LogoutLoader";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { AlertCircle, FilePlus2, LogOut, NotebookPen, NotepadText, PackageOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "~/components/ui/alert-dialog";
import { db } from "~/db/db.server";
import { InternalServerError, InvalidCredentialsError, UnauthorizedError } from "~/utils/errors.server";
import { destroySession, getSession } from "~/sessions";
import { useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";


export const meta: MetaFunction = () => {
  return [
    { title: "Remix notes app" },
    { name: "description", content: "Notes app built with Remix" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await checkAuthentication(request);
    const notes = await db.notes.findMany();
    return json({ notes, user });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof InvalidCredentialsError || error instanceof UnauthorizedError) {
      // Automatically redirect the user to login page whenever they encounter any of the above failing checks. destroy the existing cookies if there are
      const session = await getSession(request.headers.get("Cookie"));
      return redirect("/login", {
        headers: {
          "Set-Cookie": await destroySession(session)
        }
      });
    } else {
      throw new InternalServerError("Error 500 - Internal server error. Check the logs");
    }
  }
}

export async function action({ request }: ActionFunctionArgs) {
  // TODO: Add require auth logic
  try {
    const formData = await request.formData();
    const user = await checkAuthentication(request);
  
    switch (request.method) {
      case "POST": {
        const newNoteTitle = formData.get("new-note-title")?.toString();
        const newNoteBody = formData.get("new-note-body")?.toString();
        if (!newNoteTitle) {
          return json({ error: 'Note title required' });
        }
        await db.notes.create({
          data: {
            title: newNoteTitle,
            body: newNoteBody || "",
            authorId: user.id
          }
        });
        return null;
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

  return null;
}

export default function Index() {
  const { notes, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();

  // reset form when form submission is ok
  const $form = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === "idle" && !actionData?.error) {
      $form.current?.reset();
    }
  }, [navigation, actionData]);

  if ((nav.state === "submitting" || nav.state === "loading") && nav.formAction === "/logout") {
      return <LogOutLoader />
  }

  return (
    <div className="p-2 pb-8 max-w-[1100px] mx-auto">
      
      <div className="mt-4">
        <div className="w-fit ml-auto mb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <LogOut className="mr-2" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className=" w-11/12">
              <AlertDialogHeader>
                <AlertDialogTitle>Log out</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to logout?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Form method="POST" action="/logout">
                  <AlertDialogAction type="submit" className="bg-red-600 w-full">
                    Yes, Logout
                  </AlertDialogAction>
                </Form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="w-fit mx-auto text-center">
          <h1 className="text-4xl font-semibold flex items-center gap-2 mb-2 select-none">
            <NotebookPen size="2rem" />
            Notes App
          </h1>
          <p className="px-2 bg-amber-100 rounded-md">Notes by: <span className="font-semibold italic underline decoration-2 text-orange-400">@{user?.username}</span></p>
        </div>
      </div>

      <div className="mt-14 max-w-3xl mx-auto">
        <Form method="POST" ref={$form}>
          <Card>
            <CardHeader>
              <CardTitle>Add new note</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                  <Input
                    placeholder="Note title..."
                    id="new-note-title"
                    name="new-note-title"
                    required
                  />
                  <Textarea
                    placeholder="Note..."
                    name="new-note-body"
                    id="new-note-body"
                  />
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
            <CardFooter>
              <Button type="submit" className="w-full">
                <FilePlus2 className="mr-4" /> Add New Note
              </Button>
            </CardFooter>
          </Card>
        </Form>
      </div>

      <hr className="my-8 border-2 border-slate-400 border-dashed" />

      <h2 className="flex justify-center items-center gap-1 text-2xl text-center font-semibold mb-4">
        <NotepadText />
        My Notes
      </h2>
      <ul className=" list-none grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 justify-items-center">
        {
          notes.length > 0
            ? (
              notes.map(note => (
                <li key={note.id} className="block w-fit">
                  <NoteItem
                    id={note.id}
                    title={note.title}
                    body={note.body}
                    createdAt={new Date(note.createdAt)}
                    updatedAt={typeof note.updatedAt === "string" ? new Date(note.updatedAt) : null}
                  />
                </li>
              ))
            ) : (
              <div
                className="grid place-content-center place-items-center p-24"
              >
                <PackageOpen size="2.5rem" className="mb-4" />
                <span className="text-center text-xl italic">It&#39;s empty here</span>
              </div>
            )
        }
      </ul>
    </div>
  );
}

export function ErrorBoundary() {
  return (
      <div className="text-center min-h-screen grid place-content-center gap-2">
          <h1 className="text-4xl">Error</h1>
          <p>Check the logs</p>
      </div>
  )
}

