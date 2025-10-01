import { useShowPassword } from "../hooks/use-show-password";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (val: string) => void;
  inputClassName?: string;
  placeholder?: string;
};

export default function PasswordInput({ value, onChange, inputClassName = "", placeholder }: Props) {
  const { show, toggleShow } = useShowPassword();

  return (
    <div className="relative">
      <Input
        id="password"
        type={show ? "text" : "password"}
        autoComplete="current-password"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "Password"}    // ← pakai props!
        className={inputClassName + " pr-12"}
        required
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400"
        onClick={toggleShow}
        tabIndex={-1}
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
