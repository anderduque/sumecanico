import type { ComponentProps } from "react";
import { whatsAppWaMeUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export function WhatsAppLink({
  message,
  className,
  ...props
}: ComponentProps<"a"> & { message: string }) {
  return (
    <a
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700",
        className ?? "",
      ].join(" ")}
      href={whatsAppWaMeUrl(message)}
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      <WhatsAppIcon className="h-4 w-4" />
      <span>{props.children ?? "WhatsApp"}</span>
    </a>
  );
}
