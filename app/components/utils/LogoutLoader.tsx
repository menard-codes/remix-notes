import { LoaderCircle } from "lucide-react"

export function LogOutLoader() {
    return (
        <div className="min-h-screen grid place-content-center justify-items-center gap-4">
            <LoaderCircle size="3rem" className="animate-spin" />
            <h1 className="text-3xl font-semibold">
              Logging Out...
            </h1>
        </div>
    )
  }
  