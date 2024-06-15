import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, json, redirect, useLoaderData } from "@remix-run/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { Note } from "~/models/note.model";
import { getSession } from "~/sessions";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
import { db } from "~/db/db.server";

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
    <div className="p-2">
      
      <div className="flex justify-between my-8">
        <div>
          <h1 className="text-4xl font-semibold">Notes App</h1>
          <p>Logged in as: <span className="font-semibold italic">{user?.username}</span></p>
        </div>
        <Form method="POST" action="/logout">
          <Button type="submit" variant="destructive">Logout</Button>
        </Form>
      </div>

      <ul className=" list-none grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 justify-items-center">
        {
          notes.map(note => (
            <li key={note.id} className="block w-fit">
              <Note
                id={note.id}
                title={note.title}
                body={note.body}
                createdAt={note.createdAt}
              />
            </li>
          ))
        }
      </ul>
    </div>
  );
}

function Note({ id, title, body, createdAt, updatedAt }: Omit<Note, "authorId">) {
  const [onEdit, setOnEdit] = useState(false);

  return (
    <Card className="w-[350px] h-full">
      {
        onEdit
          ? (
            <>
              <CardHeader>
                <CardTitle>Edit Note</CardTitle>
              </CardHeader>
              <CardContent>
                <Form method="POST">
                  <div>
                    <Label htmlFor={`note-${id}-title`}>Title</Label>
                    <Input
                      placeholder="Title"
                      defaultValue={title}
                      id={`note-${id}-title`}
                      name="title"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`id-${id}-body`}>Note</Label>
                    <Textarea
                      name="body"
                      id={`id-${id}-body`}
                      placeholder="Note body"
                      defaultValue={body || ''}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <Button type="button" variant="outline" onClick={() => setOnEdit(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </div>
                </Form>
              </CardContent>
            </>
          )
          : (
            <>
              <CardHeader className="flex flex-row justify-between">
                <CardTitle>{title}</CardTitle>

                {/* delete button and alert context */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button aria-label={`delete note: ${title}`}>
                      <Trash2 color="hsl(0 84 60)" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete <strong>{title}</strong> note</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this note?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className=" bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </CardHeader>
              <CardContent>
                {body}
                <em className="block mt-4 text-xs text-gray-500">
                  Created at: {createdAt.toLocaleDateString()}
                </em>
                {
                  updatedAt && (
                    <em className="block text-xs text-gray-500">
                      Updated at: {updatedAt.toLocaleDateString()}
                    </em>
                  )
                }
              </CardContent>
              <CardFooter>
                <Button onClick={() => setOnEdit(true)}>
                  Edit
                </Button>
              </CardFooter>
            </>
          )
      }
    </Card>
  )
}
