import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, json, redirect, useLoaderData } from "@remix-run/react";
import type { Note } from "~/models/note.model";
import { getSession } from "~/sessions";
import jwt from "jsonwebtoken";
import NoteItem from "./NoteItem";
import dotenv from "dotenv";
import { db } from "~/db/db.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FilePlus2, LogOut, PackageOpen } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog";


export const meta: MetaFunction = () => {
  return [
    { title: "Remix notes app" },
    { name: "description", content: "Notes app built with Remix" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  dotenv.config();
  
  const session = await getSession(request.headers.get("Cookie"));
  
  // check if jwt is already in the cookie and check if it is valid
  // ----
  // validate jwt
  const token = session.get("jwt") as string;

  if (!token) {
    return redirect("/login");
  }

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
          console.log('invalid or expired token', decoded);
          return null;
      }
      // check if the user with that id exists
      const user = await db.users.findFirst({ where: { id: decoded.userId }, select: { username: true } });
      if (!user) {
          // TODO: This should be an error
          console.log(`user with id ${decoded.userId} does not exist`);
          return null;
      }
      // if all tests passed, just return null
      return json(user);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return redirect("/login");
    }

    console.log('error....');
    console.error(error);
    return null;
  }

}

export default function Index() {
  // NOTE: Dummy data, remove later
  const notes: Note[] = [
    {
      id: 1,
      title: 'To study',
      body: 'gotta study fullstack dev',
      authorId: 1000,
      createdAt: new Date()
    },
    {
      id: 2,
      title: 'Goal',
      body: 'To build a Shopify App as a side business',
      authorId: 1000,
      createdAt: new Date()
    },
    {
      id: 3,
      title: 'AWS',
      body: 'Cloud is an essential skill that can boost my resume as a fullstack dev',
      authorId: 1000,
      createdAt: new Date()
    },
    {
      id: 4,
      title: 'Taxes',
      body: 'gotta learn about personal finance, including taxes',
      authorId: 1000,
      createdAt: new Date()
    },
  ];
  const user = useLoaderData<typeof loader>();

  return (
    <div className="p-2 pb-8 max-w-[1100px] mx-auto">
      
      <div className="mt-4">
        <div className="w-fit ml-auto">
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
          <h1 className="text-4xl font-semibold">Notes App</h1>
          <p>Logged in as: <span className="font-semibold italic">{user?.username}</span></p>
        </div>
      </div>

      <div className="mt-14 max-w-3xl mx-auto">
        <Form method="POST">
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

      <h2 className=" text-2xl text-center font-semibold mb-4">Notes List</h2>
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
                    createdAt={note.createdAt}
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
