import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, json, redirect, useLoaderData } from "@remix-run/react";
import type { Note } from "~/models/note.model";
import { getSession } from "~/sessions";
import jwt from "jsonwebtoken";
import NoteItem from "./NoteItem";
import dotenv from "dotenv";
import { db } from "~/db/db.server";
import { Button } from "~/components/ui/button";


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
    <div className="p-2 max-w-[1100px] mx-auto">
      
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
              <NoteItem
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
