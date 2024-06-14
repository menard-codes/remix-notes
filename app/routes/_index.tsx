import type { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useState } from "react";
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

export const meta: MetaFunction = () => {
  return [
    { title: "Remix notes app" },
    { name: "description", content: "Notes app built with Remix" },
  ];
};


export default function Index() {
  // NOTE: Dummy data, remove later
  const notes: Note[] = [
    {
      id: 1,
      title: 'To study',
      body: 'gotto study fullstack dev',
      authorId: 1000
    },
    {
      id: 2,
      title: 'Goal',
      body: 'To build a Shopify App as a side business',
      authorId: 1000
    },
    {
      id: 3,
      title: 'AWS',
      body: 'Cloud is an essential skill that can boost my resume as a fullstack dev',
      authorId: 1000
    },
    {
      id: 4,
      title: 'Taxes',
      body: 'gotta learn about personal finance, including taxes',
      authorId: 1000
    },
  ];

  return (
    <div>
      <h1 className=" text-center text-4xl font-semibold my-8">Notes App</h1>
      <ul className=" list-none grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 justify-items-center">
        {
          notes.map(note => (
            <li key={note.id} className="block w-fit">
              <Note id={note.id} title={note.title} body={note.body} />
            </li>
          ))
        }
      </ul>
    </div>
  );
}

function Note({ id, title, body }: Omit<Note, "authorId">) {
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
                <Form>
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
                      defaultValue={body}
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
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                {body}
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
