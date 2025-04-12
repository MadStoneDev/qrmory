import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { QRControlType } from "@/types/qr-controls";
import { getSoftBgColor } from "@/utils/colour-utils";

interface CouponSaveData {
  controlType: string;
  title: string;
  discount: string;
  type: string;
  desc: string;
  cta: string;
  color: string;
  theme: string;
  exp: string;
  biz: string;
}

export default function QRCoupon({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  // States for coupon fields
  const [dealTitle, setDealTitle] = useState(initialData?.title || "");
  const [discount, setDiscount] = useState(initialData?.discount || "");
  const [discountType, setDiscountType] = useState(
    initialData?.type || "percent",
  ); // percent, amount, free, bogo
  const [description, setDescription] = useState(initialData?.desc || "");
  const [ctaText, setCtaText] = useState(initialData?.cta || "Redeem Offer");
  const [brandColor, setBrandColor] = useState(initialData?.color || "#3B82F6"); // Default blue
  const [bgTheme, setBgTheme] = useState(initialData?.theme || "light"); // light or dark
  const [expiryDate, setExpiryDate] = useState(initialData?.exp || "");
  const [businessName, setBusinessName] = useState(initialData?.biz || "");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from saved data if available
  useEffect(() => {
    if (initialData && !isInitialized) {
      setDealTitle(initialData.title || "");
      setDiscount(initialData.discount || "");
      setDiscountType(initialData.type || "percent");
      setDescription(initialData.desc || "");
      setCtaText(initialData.cta || "Redeem Offer");
      setBrandColor(initialData.color || "#3B82F6");
      setBgTheme(initialData.theme || "light");
      setExpiryDate(initialData.exp || "");
      setBusinessName(initialData.biz || "");
      setIsInitialized(true);

      // If we have a deal title, update the parent value
      if (initialData.title) {
        setTimeout(updateParentValue, 0);
      }
    }
  }, [initialData, isInitialized]);

  // Format the discount value based on type
  const formatDiscount = () => {
    if (!discount && discountType !== "free" && discountType !== "bogo")
      return "";

    switch (discountType) {
      case "percent":
        return `${discount}% OFF`;
      case "amount":
        return `$${discount} OFF`;
      case "free":
        return "FREE";
      case "bogo":
        return "BUY ONE GET ONE";
      default:
        return discount;
    }
  };

  const createSaveData = () => {
    return {
      controlType: "coupon", // Add controlType
      title: dealTitle,
      discount: discount,
      type: discountType,
      desc: description,
      cta: ctaText,
      color: brandColor,
      theme: bgTheme,
      exp: expiryDate,
      biz: businessName,
    };
  };

  // Base64 encode JSON data
  const encodeCouponData = () => {
    const data = {
      title: dealTitle,
      discount: discount,
      type: discountType,
      desc: description,
      cta: ctaText,
      color: brandColor,
      theme: bgTheme,
      exp: expiryDate,
      biz: businessName,
      // Add timestamp to prevent caching issues
      ts: new Date().getTime(),
    };

    const jsonStr = JSON.stringify(data);
    const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));

    return encodedData;
  };

  // Update parent with coupon URL
  const updateParentValue = () => {
    if (dealTitle) {
      const encodedData = encodeCouponData();
      const couponUrl = `https://qrmory.com/coupon/${encodedData}`;
      setText(couponUrl);
      setChanged(true);

      if (setSaveData) {
        setSaveData(createSaveData());
      }
    } else {
      setText("");
      setChanged(true);

      if (setSaveData) {
        setSaveData(null);
      }
    }
  };

  // Update QR whenever form data changes
  useEffect(() => {
    // Debounce to prevent too many updates when typing
    const timer = setTimeout(() => {
      updateParentValue();
    }, 500);

    return () => clearTimeout(timer);
  }, [
    dealTitle,
    discount,
    discountType,
    description,
    ctaText,
    brandColor,
    bgTheme,
    expiryDate,
    businessName,
  ]);

  // Input change handlers
  const handleInputChange =
    (setter: Dispatch<SetStateAction<string>>) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setter(event.target.value);
    };

  // Get the soft background color based on brand color
  const softBgColor = getSoftBgColor(brandColor, 0.12);

  return (
    <>
      <label className="control-label block">
        Business Name (optional):
        <input
          type="text"
          className="control-input w-full"
          placeholder="Your Business Name"
          value={businessName}
          onChange={handleInputChange(setBusinessName)}
        />
      </label>

      <label className="control-label block">
        Deal Title*:
        <input
          type="text"
          className="control-input w-full"
          placeholder="Summer Sale"
          value={dealTitle}
          onChange={handleInputChange(setDealTitle)}
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="control-label block">
          Discount Type:
          <select
            className="control-input w-full text-qrmory-purple-800"
            value={discountType}
            onChange={handleInputChange(setDiscountType)}
          >
            <option value="percent">Percentage Off</option>
            <option value="amount">Fixed Amount Off</option>
            <option value="free">Free Item/Service</option>
            <option value="bogo">Buy One Get One</option>
          </select>
        </label>

        {discountType !== "free" && discountType !== "bogo" && (
          <label className="control-label block">
            Discount Amount (optional):
            <input
              type={discountType === "percent" ? "number" : "text"}
              className="control-input w-full"
              placeholder={discountType === "percent" ? "20" : "10.00"}
              value={discount}
              onChange={handleInputChange(setDiscount)}
              min="0"
              max={discountType === "percent" ? "100" : undefined}
            />
          </label>
        )}
      </div>

      <label className="control-label block">
        Description:
        <textarea
          className="control-input w-full"
          placeholder="Valid for all items in store. Cannot be combined with other offers."
          value={description}
          onChange={handleInputChange(setDescription)}
          rows={2}
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="control-label block">
          CTA Button Text:
          <input
            type="text"
            className="control-input w-full"
            placeholder="Redeem Offer"
            value={ctaText}
            onChange={handleInputChange(setCtaText)}
          />
        </label>

        <label className="control-label block">
          Expiry Date:
          <input
            type="date"
            className="control-input w-full"
            value={expiryDate}
            onChange={handleInputChange(setExpiryDate)}
            min={new Date().toISOString().split("T")[0]}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="control-label block">
          Brand Color:
          <div className="flex items-center space-x-2">
            <input
              type="color"
              className="h-10 w-16 border-0"
              value={brandColor}
              onChange={handleInputChange(setBrandColor)}
            />
            <input
              type="text"
              className="control-input flex-grow"
              placeholder="#3B82F6"
              value={brandColor}
              onChange={handleInputChange(setBrandColor)}
            />
          </div>
        </label>

        <label className="control-label block">
          Background Theme:
          <div className="flex space-x-4 mt-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-qrmory-purple-800"
                name="bgTheme"
                value="light"
                checked={bgTheme === "light"}
                onChange={() => setBgTheme("light")}
              />
              <span className="ml-2 bg-white border border-gray-200 px-3 py-1 rounded-md">
                Light
              </span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-qrmory-purple-800"
                name="bgTheme"
                value="dark"
                checked={bgTheme === "dark"}
                onChange={() => setBgTheme("dark")}
              />
              <span className="ml-2 bg-gray-900 text-white px-3 py-1 rounded-md">
                Dark
              </span>
            </label>
          </div>
        </label>
      </div>

      {/* Preview */}
      <div className={`pt-3 rounded-lg border bg-white border-gray-200`}>
        <p className={`px-3 text-xs font-medium uppercase text-neutral-500`}>
          Preview
        </p>

        <div
          className={`mt-3 text-center rounded-md`}
          style={{ backgroundColor: softBgColor }}
        >
          <div className={`py-3 text-xl font-serif text-neutral-900`}>
            {businessName || "Your Business"}
          </div>

          <section
            className={`pt-5 pb-3 rounded-md ${
              bgTheme === "light"
                ? "text-neutral-900 bg-white"
                : "text-white bg-neutral-900"
            }`}
          >
            <div
              className="mb-5 inline-block px-3 py-1 rounded-full text-white font-semibold"
              style={{ backgroundColor: brandColor }}
            >
              {formatDiscount() || "SPECIAL OFFER"}
            </div>
            <div className="text-xl font-bold">{dealTitle || "Deal Title"}</div>

            {description && (
              <div
                className={`mx-auto mt-2 text-sm ${
                  bgTheme === "light" ? "text-gray-600" : "text-gray-300"
                } max-w-56`}
              >
                {description}
              </div>
            )}

            <button
              className="mt-8 px-4 py-2 rounded-md text-white font-medium text-sm"
              style={{ backgroundColor: brandColor }}
            >
              {ctaText || "Redeem Offer"}
            </button>

            {expiryDate && (
              <div
                className={`mt-2 text-xs ${
                  bgTheme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Valid until: {new Date(expiryDate).toLocaleDateString()}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Your coupon information will be encoded in the QR code URL for privacy.
      </div>
    </>
  );
}
