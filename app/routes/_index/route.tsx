import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import type { Note } from "~/models/note.model";

// remix imports and other utils
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { requireLogin } from "~/utils/auth.server";

// components (custom and installed/3rd-party) and icons
import NoteItem from "./NoteItem";
import { LogOutLoader } from "~/components/utils/LogoutLoader";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FilePlus2, LogOut, NotebookPen, NotepadText, PackageOpen } from "lucide-react";
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


export const meta: MetaFunction = () => {
  return [
    { title: "Remix notes app" },
    { name: "description", content: "Notes app built with Remix" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // check the user if authenticated and redirects to login if not, otherwise, returns the authenticated user
  return await requireLogin(request);
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
  const nav = useNavigation();

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
