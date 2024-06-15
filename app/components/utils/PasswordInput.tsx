import { Input } from "app/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
    id?: string;
    name?: string;
    placeholder?: string;
    required?: boolean;
}

export default function PasswordInput({ id, name, placeholder, required }: PasswordInputProps) {
    const [seePassword, setSeePassword] = useState(false);

    return (
        <div className=" relative">
            <Input
                id={id || ""}
                name={name || ""}
                placeholder={placeholder || ""}
                type={seePassword ? "text" : "password"}
                required={required}
            />
            <button
                type="button"
                className="absolute right-3 top-2/4 translate-y-[-50%]"
                onClick={() => setSeePassword(!seePassword)}
            >
                {
                    seePassword
                        ? <Eye />
                        : <EyeOff />
                }
            </button>
        </div>
    )
}
