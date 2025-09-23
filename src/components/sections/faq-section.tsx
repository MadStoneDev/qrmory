import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQSection() {
  const faqs = [
    {
      id: "faq-1",
      question: "What's the difference between static and dynamic QR codes?",
      answer:
        "Static QR codes contain fixed information that cannot be changed once created. Dynamic QR codes can be updated anytime without reprinting - you can change the destination URL, track analytics, and even schedule different content for different times.",
    },
    {
      id: "faq-2",
      question: "How many QR codes can I create for free?",
      answer:
        "Free users can create unlimited static QR codes and up to 3 dynamic QR codes. Our dynamic QR codes include" +
        " analytics, the ability to update content, and advanced customisation options.",
    },
    {
      id: "faq-3",
      question: "Are QRmory QR codes safe to scan?",
      answer:
        "Absolutely! We implement enterprise-grade security measures including fraud detection, safe browsing checks, and regular security audits. All QRmory codes are monitored for malicious content to protect both you and your users.",
    },
    {
      id: "faq-4",
      question: "Can I customise the appearance of my QR codes?",
      answer:
        "Yes! QRmory offers extensive customisation options including colors and logos. You can match your QR codes" +
        " to your brand identity while maintaining optimal scanability.",
    },
    {
      id: "faq-5",
      question: "Do QR codes expire?",
      answer:
        "Static QR codes never expire and will work forever. Dynamic QR codes remain active as long as your" +
        " subscription is active.",
    },
    {
      id: "faq-6",
      question: "What analytics do I get with dynamic QR codes?",
      answer:
        "Dynamic QR codes provide comprehensive analytics including scan count, location data, device types, time" +
        " patterns, and referrer information. This helps you understand your audience and optimise your campaigns.",
    },
    {
      id: "faq-7",
      question: "What happens if I exceed my quota?",
      answer:
        "If your needs outgrow your dynamic QR code limit, you can upgrade to a tier that better suits your needs.",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-qrmory-purple-800 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Got questions? We've got answers! Here are the most common questions
          about QRmory and our QR code services.
        </p>
      </div>

      <div className="max-w-2xl w-full mx-auto">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border border-qrmory-purple-200 rounded-lg px-6 py-2 bg-white hover:bg-qrmory-purple-50 transition-colors duration-300"
            >
              <AccordionTrigger className="text-left font-semibold text-qrmory-purple-800 hover:text-qrmory-purple-600 py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-neutral-700 leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="text-center mt-12">
        <p className="text-neutral-600 mb-4">
          Still have questions? We're here to help!
        </p>
        <a
          href="/help/contact"
          className="inline-flex items-center px-6 py-3 bg-qrmory-purple-800 text-white rounded-lg font-semibold hover:bg-qrmory-purple-700 transition-colors duration-300"
        >
          Contact Support
        </a>
      </div>
    </section>
  );
}
