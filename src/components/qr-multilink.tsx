// components/qr-multilink.tsx
import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

interface MultiLinkSaveData {
  controlType: string;
  pageTitle: string;
  description: string;
  links: LinkItem[];
  titleColour: string;
  backgroundColour: string;
  textColour: string;
  buttonColour: string;
}

// Sortable Link Component
function SortableLink({
  link,
  index,
  onUpdate,
  onRemove,
  isValidUrl,
}: {
  link: LinkItem;
  index: number;
  onUpdate: (id: string, field: "title" | "url", value: string) => void;
  onRemove: (id: string) => void;
  isValidUrl: (url: string) => boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-neutral-200 rounded-lg p-3 bg-neutral-50 transition-all duration-200 ${
        isDragging ? "shadow-lg z-10" : "hover:border-neutral-300"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <div
            {...attributes}
            {...listeners}
            className="flex flex-col space-y-1 cursor-grab active:cursor-grabbing p-1 hover:bg-neutral-200 rounded"
            aria-label="Drag to reorder"
          >
            <div className="w-1 h-1 bg-neutral-400 rounded-full"></div>
            <div className="w-1 h-1 bg-neutral-400 rounded-full"></div>
            <div className="w-1 h-1 bg-neutral-400 rounded-full"></div>
          </div>
          <span className="text-xs font-medium text-neutral-500">
            Link {index + 1}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(link.id)}
          className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
          title="Remove link"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          className="control-input w-full text-sm"
          placeholder="Link title (e.g., My Website)"
          value={link.title}
          onChange={(e) => onUpdate(link.id, "title", e.target.value)}
          maxLength={40}
        />
        <input
          type="url"
          className="control-input w-full text-sm"
          placeholder="URL (e.g., https://example.com)"
          value={link.url}
          onChange={(e) => onUpdate(link.id, "url", e.target.value)}
        />
        {link.url && !isValidUrl(link.url) && (
          <p className="text-red-500 text-xs">Please enter a valid URL</p>
        )}
      </div>
    </div>
  );
}

export default function QRMultiLink({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [pageTitle, setPageTitle] = useState(initialData?.pageTitle || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [links, setLinks] = useState<LinkItem[]>(initialData?.links || []);
  const [backgroundColour, setBackgroundColour] = useState(
    initialData?.backgroundColour || "#ffffff",
  );
  const [textColour, setTextColour] = useState(
    initialData?.textColour || "#000000",
  );
  const [titleColour, setTitleColour] = useState(
    initialData?.titleColour || "#000000",
  );
  const [buttonColour, setbuttonColour] = useState(
    initialData?.buttonColour || "#3B82F6",
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Initialize from saved data if available
  useEffect(() => {
    if (initialData && !isInitialized) {
      setPageTitle(initialData.pageTitle || "");
      setDescription(initialData.description || "");
      setLinks(initialData.links || []);
      setBackgroundColour(initialData.backgroundColour || "#ffffff");
      setTitleColour(initialData.titleColour || "#000000");
      setTextColour(initialData.textColour || "#000000");
      setbuttonColour(initialData.buttonColour || "#3B82F6");
      setIsInitialized(true);

      // Update parent with initial value
      if (
        initialData.pageTitle ||
        (initialData.links && initialData.links.length > 0)
      ) {
        setTimeout(updateParentValue, 0);
      }
    }
  }, [initialData, isInitialized]);

  // Add a new link
  const addLink = () => {
    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: "",
      url: "",
    };
    setLinks([...links, newLink]);
  };

  // Remove a link
  const removeLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  // Update a link
  const updateLink = (id: string, field: "title" | "url", value: string) => {
    setLinks(
      links.map((link) =>
        link.id === id ? { ...link, [field]: value } : link,
      ),
    );
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Validate URL format
  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  // Format URL to ensure it has protocol
  const formatUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  // Generate encoded data for the multi-link page
  const generateEncodedData = () => {
    const validLinks = links.filter(
      (link) => link.title && link.url && isValidUrl(link.url),
    );

    if (validLinks.length === 0 && !pageTitle) return "";

    const data = {
      pageTitle: pageTitle || "My Links",
      description,
      links: validLinks.map((link) => ({
        ...link,
        url: formatUrl(link.url),
      })),
      backgroundColour: backgroundColour,
      textColour,
      buttonColour,
      // Add timestamp to prevent caching issues
      ts: new Date().getTime(),
    };

    const jsonStr = JSON.stringify(data);
    const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));
    return encodedData;
  };

  // Update parent with multi-link URL
  const updateParentValue = () => {
    const validLinks = links.filter(
      (link) => link.title && link.url && isValidUrl(link.url),
    );

    if (validLinks.length > 0 || pageTitle) {
      const encodedData = generateEncodedData();
      const multiLinkUrl = `https://qrmory.com/links/${encodedData}`;
      setText(multiLinkUrl);
      setChanged(true);

      if (setSaveData) {
        const saveData: MultiLinkSaveData = {
          controlType: "multilink",
          pageTitle: pageTitle || "My Links",
          description,
          links: validLinks.map((link) => ({
            ...link,
            url: formatUrl(link.url),
          })),
          backgroundColour: backgroundColour,
          titleColour: titleColour,
          textColour: textColour,
          buttonColour: buttonColour,
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
    const timer = setTimeout(updateParentValue, 500);
    return () => clearTimeout(timer);
  }, [
    pageTitle,
    description,
    links,
    backgroundColour,
    textColour,
    buttonColour,
  ]);

  // Add first link if none exist
  useEffect(() => {
    if (links.length === 0 && !isInitialized) {
      addLink();
    }
  }, [links.length, isInitialized]);

  return (
    <section className="flex flex-col">
      <label className="control-label">
        Page Title:
        <input
          type="text"
          className="control-input w-full"
          placeholder="My Links"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          maxLength={60}
        />
      </label>

      <label className="control-label">
        Description (optional):
        <input
          type="text"
          className="control-input w-full"
          placeholder="Find all my social media and websites in one place"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={120}
        />
      </label>

      {/* Links Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-neutral-700">
            Links ({links.length}/10)
          </h4>
          <button
            type="button"
            onClick={addLink}
            disabled={links.length >= 10}
            className="text-sm px-3 py-1 bg-qrmory-purple-600 text-white rounded hover:bg-qrmory-purple-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            Add Link
          </button>
        </div>

        <div className="text-xs text-neutral-500 mb-2">
          💡 Tip: Drag the handle (⋮⋮⋮) to reorder links
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map((link) => link.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {links.map((link, index) => (
                <SortableLink
                  key={link.id}
                  link={link}
                  index={index}
                  onUpdate={updateLink}
                  onRemove={removeLink}
                  isValidUrl={isValidUrl}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Style Customization */}
      <div className="border-t pt-4 mt-6">
        <h4 className="text-sm font-medium text-neutral-700 mb-3">
          Customize Appearance
        </h4>

        <div className="flex flex-col md:flex-row flex-wrap gap-4">
          <label className="control-label">
            Title Colour:
            <div className="flex items-center space-x-2">
              <input
                type="color"
                className="shrink-0 h-8 w-2 border-0 rounded"
                value={titleColour}
                onChange={(e) => setTitleColour(e.target.value)}
              />
              <input
                type="text"
                className="control-input flex-grow text-sm"
                value={titleColour}
                onChange={(e) => setTitleColour(e.target.value)}
              />
            </div>
          </label>

          <label className="control-label">
            Background Colour:
            <div className="flex items-center space-x-2">
              <input
                type="color"
                className="shrink-0 h-8 w-2 border-0 rounded"
                value={backgroundColour}
                onChange={(e) => setBackgroundColour(e.target.value)}
              />
              <input
                type="text"
                className="control-input flex-grow text-sm"
                value={backgroundColour}
                onChange={(e) => setBackgroundColour(e.target.value)}
              />
            </div>
          </label>

          <label className="control-label">
            Text Colour:
            <div className="flex items-center space-x-2">
              <input
                type="color"
                className="shrink-0 h-8 w-2 border-0 rounded"
                value={textColour}
                onChange={(e) => setTextColour(e.target.value)}
              />
              <input
                type="text"
                className="control-input flex-grow text-sm"
                value={textColour}
                onChange={(e) => setTextColour(e.target.value)}
              />
            </div>
          </label>

          <label className="control-label">
            Button Colour:
            <div className="flex items-center space-x-2">
              <input
                type="color"
                className="shrink-0 h-8 w-2 border-0 rounded"
                value={buttonColour}
                onChange={(e) => setbuttonColour(e.target.value)}
              />
              <input
                type="text"
                className="control-input flex-grow text-sm"
                value={buttonColour}
                onChange={(e) => setbuttonColour(e.target.value)}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Preview */}
      {(pageTitle || links.some((link) => link.title && link.url)) && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div
            className="mt-3 mx-3 mb-3 rounded-lg overflow-hidden"
            style={{ backgroundColor: backgroundColour }}
          >
            <div className="p-6 text-center" style={{ color: textColour }}>
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: titleColour }}
              >
                {pageTitle || "My Links"}
              </h2>
              {description && (
                <p className="text-sm opacity-80 mb-6">{description}</p>
              )}

              <div className="space-y-3 max-w-sm mx-auto">
                {links
                  .filter(
                    (link) => link.title && link.url && isValidUrl(link.url),
                  )
                  .map((link) => (
                    <div
                      key={link.id}
                      className="block w-full py-3 px-4 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
                      style={{ backgroundColor: buttonColour }}
                    >
                      {link.title}
                    </div>
                  ))}
              </div>

              {links.filter(
                (link) => link.title && link.url && isValidUrl(link.url),
              ).length === 0 && (
                <div className="text-sm opacity-60">
                  Add links above to see them here
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
