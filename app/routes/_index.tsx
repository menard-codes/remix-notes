import type { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
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
      note_author: 1000
    },
    {
      id: 2,
      title: 'Goal',
      body: 'To build a Shopify App as a side business',
      note_author: 1000
    },
    {
      id: 3,
      title: 'AWS',
      body: 'Cloud is an essential skill that can boost my resume as a fullstack dev',
      note_author: 1000
    },
    {
      id: 4,
      title: 'Taxes',
      body: 'gotta learn about personal finance, including taxes',
      note_author: 1000
    },
  ];

  return (
    <div>
      <h1 className=" text-center text-4xl font-semibold my-8">Notes App</h1>
      <ul className=" list-none">
        {
          notes.map(note => (
            <li key={note.id}>
              <Note id={note.id} title={note.title} body={note.body} />
            </li>
          ))
        }
      </ul>
    </div>
  );
}

function Note({ id, title, body }: Omit<Note, "note_author">) {
  const [onEdit, setOnEdit] = useState(false);

  return (
    <div className=" border-0 border-solid border-slate-700 rounded">
      {
        onEdit
          ? (
            <>
              <Form>
                <div>
                  <label htmlFor={`note-${id}-title`}>Title</label>
                  <input
                    placeholder="Title"
                    value={title}
                    id={`note-${id}-title`}
                    name="title"
                  />
                </div>
                <div>
                  <textarea
                    name="body"
                    id={`id-${id}-body`}
                    placeholder="Note body"
                    value={body}
                  ></textarea>
                </div>
                <Button type="button" variant="outline" onClick={() => setOnEdit(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </Form>
            </>
          )
          : (
            <>
              <p>{title}</p>
              <p>{body}</p>
              <Button onClick={() => setOnEdit(true)}>
                Edit
              </Button>
            </>
          )
      }
    </div>
  )
}
