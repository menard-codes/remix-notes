import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button, buttonVariants } from "~/components/ui/button";
import { Link as LinkIcon } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div>
      <h1 className=" text-center text-4xl font-semibold my-8">My Remix App</h1>
      <Button className=" block mx-auto">Click Me</Button>
      <div className="w-fit mx-auto my-4">
        <Link to="#" className={buttonVariants()}>
          <LinkIcon className="mr-2 w-4 h-4" />
          This is a Link Button
        </Link>
      </div>
    </div>
  );
}
