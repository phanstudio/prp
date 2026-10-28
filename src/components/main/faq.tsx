import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string | React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    question: "How do I customize meme captions and fonts?",
    answer:
      "Select any text element on the canvas to open its styling options. You can change the font family, font size, text color, bold/italic styles, and add high-contrast meme outlines or soft drop shadows.",
  },
  {
    question: "How do I move and resize text on the canvas?",
    answer:
      "Click directly on any text box on the canvas and drag it to reposition. Use the blue corner and edge handles to resize the box; text will automatically adjust its size to fit cleanly inside.",
  },
  {
    question: "Can I copy the meme directly instead of downloading?",
    answer:
      "Yes! In the Meme Generator, click the 'Copy Image' button to copy the rendered high-resolution PNG directly to your clipboard, ready to paste into Discord, X (Twitter), Telegram, or Slack.",
  },
  {
    question: "Can I create my own reusable meme templates?",
    answer:
      "Administrators and registered creators can upload any background image and pre-position text boxes in the Template Creator to add new public templates to the gallery.",
  },
];

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 mt-6">
      <div className="card-body p-5 sm:p-6">
        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-primary" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-base-300 rounded-lg overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-3.5 text-left font-semibold text-xs sm:text-sm flex items-center justify-between gap-2 hover:bg-base-200/50 transition-colors select-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-base-content/60 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs text-base-content/70 border-t border-base-200/40 bg-base-200/20 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Faq;
