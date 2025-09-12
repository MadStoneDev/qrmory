// components/qr-poll.tsx
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
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";

interface PollOption {
  id: string;
  text: string;
}

interface PollSaveData {
  controlType: string;
  question: string;
  description: string;
  options: PollOption[];
  allowMultiple: boolean;
  startDate: string;
  endDate: string;
  showResults: boolean;
  requireName: boolean;
}

// Sortable Option Component
function SortableOption({
  option,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  option: PollOption;
  index: number;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

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
      <div className="flex justify-between items-center gap-2 mb-2">
        <div className="flex items-center space-x-1">
          <div
            {...attributes}
            {...listeners}
            className="flex flex-col space-y-1 cursor-grab active:cursor-grabbing p-1 hover:bg-neutral-200 rounded"
            aria-label="Drag to reorder"
          >
            <IconDotsVertical size={20} />
          </div>
          <span className="flex items-center justify-center bg-qrmory-purple-800 h-8 aspect-square rounded-full text-xs font-medium text-neutral-200">
            {index + 1}
          </span>
        </div>

        <input
          type="text"
          className="control-input w-full text-sm"
          placeholder={`Option ${index + 1}`}
          value={option.text}
          onChange={(e) => onUpdate(option.id, e.target.value)}
          maxLength={100}
        />

        <button
          type="button"
          onClick={() => onRemove(option.id)}
          disabled={!canRemove}
          className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          title="Remove option"
        >
          <IconTrash size={16} />
        </button>
      </div>
    </div>
  );
}

export default function QRPoll({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [question, setQuestion] = useState(initialData?.question || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [options, setOptions] = useState<PollOption[]>(
    initialData?.options || [],
  );
  const [allowMultiple, setAllowMultiple] = useState(
    initialData?.allowMultiple || false,
  );
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [showResults, setShowResults] = useState(
    initialData?.showResults !== false,
  );
  const [requireName, setRequireName] = useState(
    initialData?.requireName || false,
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
      setQuestion(initialData.question || "");
      setDescription(initialData.description || "");
      setOptions(initialData.options || []);
      setAllowMultiple(initialData.allowMultiple || false);
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setShowResults(initialData.showResults !== false);
      setRequireName(initialData.requireName || false);
      setIsInitialized(true);

      if (
        initialData.question &&
        initialData.options &&
        initialData.options.length >= 2
      ) {
        setTimeout(updateParentValue, 0);
      }
    }
  }, [initialData, isInitialized]);

  // Add a new option
  const addOption = () => {
    const newOption: PollOption = {
      id: Date.now().toString(),
      text: "",
    };
    setOptions([...options, newOption]);
  };

  // Remove an option
  const removeOption = (id: string) => {
    setOptions(options.filter((option) => option.id !== id));
  };

  // Update an option
  const updateOption = (id: string, text: string) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, text } : option,
      ),
    );
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOptions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Generate encoded data for the poll
  const generateEncodedData = () => {
    const validOptions = options.filter((option) => option.text.trim());

    if (!question || validOptions.length < 2) return "";

    const data = {
      question: question.trim(),
      description: description.trim(),
      options: validOptions,
      allowMultiple,
      startDate,
      endDate,
      showResults,
      requireName,
      ts: new Date().getTime(),
    };

    const jsonStr = JSON.stringify(data);
    const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));
    return encodedData;
  };

  // Update parent with poll URL
  const updateParentValue = () => {
    const validOptions = options.filter((option) => option.text.trim());

    if (question && validOptions.length >= 2) {
      const encodedData = generateEncodedData();
      const pollUrl = `https://qrmory.com/poll/${encodedData}`;
      setText(pollUrl);
      setChanged(true);

      if (setSaveData) {
        const saveData: PollSaveData = {
          controlType: "poll",
          question: question.trim(),
          description: description.trim(),
          options: validOptions,
          allowMultiple,
          startDate,
          endDate,
          showResults,
          requireName,
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
    question,
    description,
    options,
    allowMultiple,
    startDate,
    endDate,
    showResults,
    requireName,
  ]);

  // Add initial options if none exist
  useEffect(() => {
    if (options.length === 0 && !isInitialized) {
      setOptions([
        { id: "1", text: "" },
        { id: "2", text: "" },
      ]);
    }
  }, [options.length, isInitialized]);

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().slice(0, 16);
  };

  const validOptionsCount = options.filter((option) =>
    option.text.trim(),
  ).length;

  return (
    <section className="flex flex-col">
      <label className="control-label">
        Poll Question*:
        <input
          type="text"
          className="control-input w-full"
          placeholder="What's your favorite programming language?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={200}
        />
      </label>

      <label className="control-label">
        Description (optional):
        <textarea
          className="control-input w-full"
          placeholder="Additional context or instructions for voters..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={300}
        />
      </label>

      {/* Options Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-neutral-700">
            Poll Options ({validOptionsCount}/10)
            {validOptionsCount < 2 && (
              <span className="text-red-500 ml-1">*Minimum 2 required</span>
            )}
          </h4>
          <button
            type="button"
            onClick={addOption}
            disabled={options.length >= 10}
            className="text-sm px-3 py-1 bg-qrmory-purple-600 text-white rounded hover:bg-qrmory-purple-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            Add Option
          </button>
        </div>

        <div className="text-xs text-neutral-500 mb-2">
          💡 Tip: Drag the handle (⋮) to reorder options
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={options.map((option) => option.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {options.map((option, index) => (
                <SortableOption
                  key={option.id}
                  option={option}
                  index={index}
                  onUpdate={updateOption}
                  onRemove={removeOption}
                  canRemove={options.length > 2}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Poll Settings */}
      <div className="border-t pt-4 mt-6">
        <h4 className="text-sm font-medium text-neutral-700 mb-3">
          Poll Settings
        </h4>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allowMultiple"
              className="form-checkbox h-4 w-4 text-qrmory-purple-600"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
            />
            <label htmlFor="allowMultiple" className="text-sm text-neutral-700">
              Allow multiple selections
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showResults"
              className="form-checkbox h-4 w-4 text-qrmory-purple-600"
              checked={showResults}
              onChange={(e) => setShowResults(e.target.checked)}
            />
            <label htmlFor="showResults" className="text-sm text-neutral-700">
              Show results after voting
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requireName"
              className="form-checkbox h-4 w-4 text-qrmory-purple-600"
              checked={requireName}
              onChange={(e) => setRequireName(e.target.checked)}
            />
            <label htmlFor="requireName" className="text-sm text-neutral-700">
              Require voter name
            </label>
          </div>
        </div>

        {/* Time Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <label className="control-label">
            Start Date & Time (optional):
            <input
              type="datetime-local"
              className="control-input w-full text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={getMinDate()}
            />
          </label>

          <label className="control-label">
            End Date & Time (optional):
            <input
              type="datetime-local"
              className="control-input w-full text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || getMinDate()}
            />
          </label>
        </div>
      </div>

      {/* Preview */}
      {question && validOptionsCount >= 2 && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div className="mt-3 p-4 bg-white rounded-md mx-3 mb-3 border">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-neutral-800 mb-2">
                {question}
              </h3>
              {description && (
                <p className="text-sm text-neutral-600">{description}</p>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {options
                .filter((option) => option.text.trim())
                .map((option, index) => (
                  <label
                    key={option.id}
                    className="flex items-center space-x-3 p-2 border rounded hover:bg-neutral-50 cursor-pointer"
                  >
                    <input
                      type={allowMultiple ? "checkbox" : "radio"}
                      name="poll-preview"
                      className="form-checkbox h-4 w-4 text-qrmory-purple-600"
                      disabled
                    />
                    <span className="text-sm text-neutral-700">
                      {option.text}
                    </span>
                  </label>
                ))}
            </div>

            <div className="flex justify-between items-center text-xs text-neutral-500">
              <div>
                {allowMultiple
                  ? "Multiple selections allowed"
                  : "Single selection only"}
                {requireName && " • Name required"}
              </div>
              <div>
                {endDate && `Ends: ${new Date(endDate).toLocaleDateString()}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
