import { useState } from "react";

export function useShowPassword() {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow((v) => !v);
  return { show, toggleShow };
}
