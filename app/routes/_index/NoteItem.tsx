import { Notes } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { Pencil, Save, Trash2 } from "lucide-react";
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


export default function NoteItem({ id, title, body, createdAt, updatedAt }: Omit<Notes, "authorId">) {
    const [onEdit, setOnEdit] = useState(false);
    const fetcher = useFetcher();

    // TODO: Handle error state
    const handleDeleteNote = () => {
      fetcher.submit(
        { noteId: id },
        { method: "DELETE" }
      )
    }
  
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
                  <fetcher.Form method="PUT">
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
                      <Button type="submit">
                        <Save size="1.2rem" className="mr-2" />
                        Save
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setOnEdit(false)}>Cancel</Button>
                    </div>
                  </fetcher.Form>
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
                    <AlertDialogContent className="w-11/12">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete <strong className="underline decoration-2">{title}</strong> note</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this note?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className=" bg-red-600"
                          onClick={handleDeleteNote}
                        >
                          Delete
                        </AlertDialogAction>
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
                  <Button onClick={() => setOnEdit(true)} variant="secondary">
                    <Pencil className="mr-2" size="1rem" />
                    Edit
                  </Button>
                </CardFooter>
              </>
            )
        }
      </Card>
    )
  }
