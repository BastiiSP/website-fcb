"use client";

import Link from "next/link";

interface AuthSwitchPromptProps {
  frage: string;
  aktion: string;
  href: string;
}

export default function AuthSwitchPrompt({ frage, aktion, href }: AuthSwitchPromptProps) {
  return (
    <p className="text-center font-inter text-sm text-fcb-muted">
      {frage}{" "}
      <Link
        href={href}
        className="font-medium text-fcb-blue underline-offset-2 transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
      >
        {aktion}
      </Link>
    </p>
  );
}
