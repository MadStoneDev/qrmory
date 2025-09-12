// components/qr-email.tsx
import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";

interface EmailSaveData {
  controlType: string;
  email: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

export default function QREmail({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [email, setEmail] = useState(initialData?.email || "");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [cc, setCc] = useState(initialData?.cc || "");
  const [bcc, setBcc] = useState(initialData?.bcc || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from saved data if available
  useEffect(() => {
    if (initialData && !isInitialized) {
      setEmail(initialData.email || "");
      setSubject(initialData.subject || "");
      setBody(initialData.body || "");
      setCc(initialData.cc || "");
      setBcc(initialData.bcc || "");
      setIsInitialized(true);

      // Update parent with initial value
      if (initialData.email) {
        updateParentValue(
          initialData.email,
          initialData.subject || "",
          initialData.body || "",
          initialData.cc || "",
          initialData.bcc || "",
        );
      }
    }
  }, [initialData, isInitialized]);

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Update parent component with mailto URL
  const updateParentValue = (
    toEmail: string,
    subj: string,
    bodyText: string,
    ccEmails: string,
    bccEmails: string,
  ) => {
    if (toEmail.length > 0 && isValidEmail(toEmail)) {
      let mailtoUrl = `mailto:${toEmail}`;
      const params = new URLSearchParams();

      if (subj.length > 0) {
        params.append("subject", subj);
      }
      if (bodyText.length > 0) {
        params.append("body", bodyText);
      }
      if (ccEmails.length > 0) {
        params.append("cc", ccEmails);
      }
      if (bccEmails.length > 0) {
        params.append("bcc", bccEmails);
      }

      if (params.toString()) {
        mailtoUrl += "?" + params.toString();
      }

      setText(mailtoUrl);

      if (setSaveData) {
        const saveData: EmailSaveData = {
          controlType: "email",
          email: toEmail,
          subject: subj,
          body: bodyText,
          ...(ccEmails && { cc: ccEmails }),
          ...(bccEmails && { bcc: bccEmails }),
        };
        setSaveData(saveData);
      }
    } else {
      setText("");
      if (setSaveData) setSaveData(null);
    }
    setChanged(true);
  };

  // Handle input changes
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
    updateParentValue(value, subject, body, cc, bcc);
  };

  const handleSubjectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSubject(value);
    updateParentValue(email, value, body, cc, bcc);
  };

  const handleBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setBody(value);
    updateParentValue(email, subject, value, cc, bcc);
  };

  const handleCcChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCc(value);
    updateParentValue(email, subject, body, value, bcc);
  };

  const handleBccChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setBcc(value);
    updateParentValue(email, subject, body, cc, value);
  };

  return (
    <section className="flex flex-col">
      <label className="control-label">
        Email Address*:
        <input
          type="email"
          className="control-input w-full"
          placeholder="example@email.com"
          value={email}
          onChange={handleEmailChange}
        />
        {email.length > 0 && !isValidEmail(email) && (
          <p className="text-red-500 text-xs mt-1">
            Please enter a valid email address
          </p>
        )}
      </label>

      <label className="control-label">
        Subject (optional):
        <input
          type="text"
          className="control-input w-full"
          placeholder="Subject line..."
          value={subject}
          onChange={handleSubjectChange}
          maxLength={100}
        />
      </label>

      <label className="control-label">
        Message Body (optional):
        <textarea
          className="control-input w-full"
          placeholder="Dear [Name],

I wanted to share this with you...

Best regards,
[Your Name]"
          value={body}
          onChange={handleBodyChange}
          rows={5}
          maxLength={2000}
        />
        {body.length > 0 && (
          <div className="text-xs text-neutral-500 mt-1">
            {body.length}/2000 characters
          </div>
        )}
      </label>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        className="text-sm text-qrmory-purple-600 hover:text-qrmory-purple-800 underline"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? "Hide" : "Show"} Advanced Options
      </button>

      {showAdvanced && (
        <>
          <label className="control-label">
            CC (optional):
            <p className="font-sansLight italic text-neutral-400 text-sm">
              Separate multiple emails with commas
            </p>
            <input
              type="email"
              className="control-input w-full"
              placeholder="cc1@email.com, cc2@email.com"
              value={cc}
              onChange={handleCcChange}
            />
          </label>

          <label className="control-label">
            BCC (optional):
            <p className="font-sansLight italic text-neutral-400 text-sm">
              Separate multiple emails with commas
            </p>
            <input
              type="email"
              className="control-input w-full"
              placeholder="bcc1@email.com, bcc2@email.com"
              value={bcc}
              onChange={handleBccChange}
            />
          </label>
        </>
      )}

      {/* Preview */}
      {email.length > 0 && isValidEmail(email) && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div className="mt-3 p-3 bg-white rounded-md mx-3 mb-3 border">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-sm">New Email</div>
                <div className="text-xs text-neutral-500">To: {email}</div>
                {cc && <div className="text-xs text-neutral-500">CC: {cc}</div>}
                {bcc && (
                  <div className="text-xs text-neutral-500">BCC: {bcc}</div>
                )}
              </div>
            </div>

            {subject && (
              <div className="mb-2 pb-2 border-b">
                <div className="text-sm font-medium">Subject: {subject}</div>
              </div>
            )}

            {body && (
              <div className="text-sm text-neutral-700 whitespace-pre-wrap bg-neutral-50 p-2 rounded">
                {body}
              </div>
            )}

            {!subject && !body && (
              <div className="text-xs text-neutral-500 italic">
                Email client will open with recipient pre-filled
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
