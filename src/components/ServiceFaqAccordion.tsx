"use client";

import { useId, useState } from "react";

export function ServiceFaqAccordion({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const buttonId = `${baseId}-faq-${index}-button`;
        const panelId = `${baseId}-faq-${index}-panel`;
        return (
          <div
            key={`${faq.question}-${index}`}
            className={["border border-zinc-200 bg-white", isOpen ? "border-primary" : ""].join(" ")}
          >
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full bg-primary px-5 py-4 text-left text-base font-semibold text-white"
              onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
            >
              {faq.question}
            </button>
            {isOpen ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="border-t border-zinc-200 px-5 py-4 text-sm leading-7 text-zinc-700"
              >
                {faq.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

