// components/qr-calendar.tsx
import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";

interface CalendarSaveData {
  controlType: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  allDay: boolean;
}

export default function QRCalendar({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [allDay, setAllDay] = useState(initialData?.allDay || false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from saved data if available
  useEffect(() => {
    if (initialData && !isInitialized) {
      setTitle(initialData.title || "");
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setLocation(initialData.location || "");
      setDescription(initialData.description || "");
      setAllDay(initialData.allDay || false);
      setIsInitialized(true);

      // Update parent with initial value
      if (initialData.title && initialData.startDate) {
        setTimeout(updateParentValue, 0);
      }
    }
  }, [initialData, isInitialized]);

  // Format date for ICS format (YYYYMMDDTHHMMSSZ)
  const formatDateForICS = (dateString: string, isAllDay: boolean) => {
    const date = new Date(dateString);
    if (isAllDay) {
      // For all-day events, use YYYYMMDD format
      return date.toISOString().split("T")[0].replace(/-/g, "");
    } else {
      // For timed events, use UTC format
      return date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    }
  };

  // Generate ICS content
  const generateICS = () => {
    if (!title || !startDate) return "";

    const now = new Date();
    const dtStamp = now
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
    const uid = `${dtStamp}@qrmory.com`;

    const eventStart = formatDateForICS(startDate, allDay);
    const eventEnd = endDate ? formatDateForICS(endDate, allDay) : eventStart;

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//QRmory//QR Calendar Event//EN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART${allDay ? ";VALUE=DATE" : ""}:${eventStart}`,
      `DTEND${allDay ? ";VALUE=DATE" : ""}:${eventEnd}`,
      `SUMMARY:${title.replace(/[,;\\]/g, "\\$&")}`,
    ];

    if (location) {
      icsContent.push(`LOCATION:${location.replace(/[,;\\]/g, "\\$&")}`);
    }

    if (description) {
      icsContent.push(`DESCRIPTION:${description.replace(/[,;\\]/g, "\\$&")}`);
    }

    icsContent.push("END:VEVENT", "END:VCALENDAR");

    return icsContent.join("\r\n");
  };

  // Update parent component with calendar data URL
  const updateParentValue = () => {
    if (title && startDate) {
      const icsContent = generateICS();
      // Create a data URI for the ICS content
      const dataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(
        icsContent,
      )}`;

      setText(dataUri);
      setChanged(true);

      if (setSaveData) {
        const saveData: CalendarSaveData = {
          controlType: "calendar",
          title,
          startDate,
          endDate,
          location,
          description,
          allDay,
        };
        setSaveData(saveData);
      }
    } else {
      setText("");
      setChanged(true);
      if (setSaveData) setSaveData(null);
    }
  };

  // Update whenever form data changes
  useEffect(() => {
    const timer = setTimeout(updateParentValue, 300);
    return () => clearTimeout(timer);
  }, [title, startDate, endDate, location, description, allDay]);

  // Handle date/time input changes
  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setStartDate(value);

    // Auto-set end date to 1 hour later if not set
    if (!endDate && value && !allDay) {
      const start = new Date(value);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour
      setEndDate(end.toISOString().slice(0, 16));
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().slice(0, 16);
  };

  // Get formatted date for display
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      ...(allDay ? {} : { hour: "2-digit", minute: "2-digit" }),
    });
  };

  return (
    <section className="flex flex-col">
      <label className="control-label">
        Event Title*:
        <input
          type="text"
          className="control-input w-full"
          placeholder="Team Meeting"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </label>

      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          id="allDay"
          className="form-checkbox h-4 w-4 text-qrmory-purple-600"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
        />
        <label
          htmlFor="allDay"
          className="text-sm font-medium text-neutral-700"
        >
          All-day event
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="control-label">
          Start {allDay ? "Date" : "Date & Time"}*:
          <input
            type={allDay ? "date" : "datetime-local"}
            className="control-input w-full"
            value={startDate}
            onChange={handleStartDateChange}
            min={allDay ? new Date().toISOString().split("T")[0] : getMinDate()}
          />
        </label>

        <label className="control-label">
          End {allDay ? "Date" : "Date & Time"}:
          <input
            type={allDay ? "date" : "datetime-local"}
            className="control-input w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={
              startDate ||
              (allDay ? new Date().toISOString().split("T")[0] : getMinDate())
            }
          />
        </label>
      </div>

      <label className="control-label">
        Location (optional):
        <input
          type="text"
          className="control-input w-full"
          placeholder="Conference Room A, 123 Main St, City"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={200}
        />
      </label>

      <label className="control-label">
        Description (optional):
        <textarea
          className="control-input w-full"
          placeholder="Meeting agenda, notes, or additional details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
        />
      </label>

      {/* Preview */}
      {title && startDate && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div className="mt-3 p-3 bg-white rounded-md mx-3 mb-3 border">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium text-sm">{title}</div>
                <div className="text-xs text-neutral-500">Calendar Event</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-neutral-700">Start:</span>{" "}
                {formatDisplayDate(startDate)}
              </div>
              {endDate && (
                <div>
                  <span className="font-medium text-neutral-700">End:</span>{" "}
                  {formatDisplayDate(endDate)}
                </div>
              )}
              {location && (
                <div>
                  <span className="font-medium text-neutral-700">
                    Location:
                  </span>{" "}
                  {location}
                </div>
              )}
              {description && (
                <div>
                  <span className="font-medium text-neutral-700">
                    Description:
                  </span>
                  <div className="text-neutral-600 mt-1 whitespace-pre-wrap">
                    {description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
