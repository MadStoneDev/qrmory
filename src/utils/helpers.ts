import type { Tables } from "../../types_db";

type Price = Tables<"prices">;

export const getURL = (path: string = "") => {
  // Check if NEXT_PUBLIC_SITE_URL is set in the environment and it non-empty
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL &&
    process.env.NEXT_PUBLIC_SITE_URL.trim() !== ""
      ? process.env.NEXT_PUBLIC_SITE_URL // If not set, check for NEXT_PUBLIC_VERCEL_URL which is automatically set by Vercel
      : process?.env?.NEXT_PUBLIC_VERCEL_URL &&
          process.env.NEXT_PUBLIC_VERCEL_URL.trim() !== ""
        ? process.env.NEXT_PUBLIC_VERCEL_URL
        : `http://localhost:3020`;

  // Trim the URL and remove trailing slashes if any exist
  url = url.trim().replace(/\/$/, "");

  // Make sure to include https:// when not using localhost
  url = url.includes("http") ? url : `https://${url}`;

  // Ensure the path starts without a slash to avoid double slashes in the final URL
  path = path.replace(/^\/+/, "");

  // Concatenate the URL and path to form the final URL
  return path ? `${url}/${path}` : url;
};

export const postData = async ({
  url,
  data,
}: {
  url: string;
  data?: { price: Price };
}) => {
  const res = await fetch(url, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const toDateTime = (secs: number) => {
  return new Date(Math.round(secs * 1000));
};

export const calculateTrialEndUnixTimestamp = (
  trialPeriodDays: number | null | undefined,
) => {
  // Check if trialPeriodDays is null or undefined, or less than 2 days
  if (
    trialPeriodDays === null ||
    trialPeriodDays === undefined ||
    trialPeriodDays < 2
  ) {
    return undefined;
  }

  const currentDate = new Date();
  const trialEndDate = new Date(
    currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000,
  );
  return Math.floor(trialEndDate.getTime() / 1000);
};

const toastKeyMap: { [key: string]: string[] } = {
  status: ["status", "status_description"],
  error: ["error", "error_description"],
};

const getToastRedirect = (
  path: string,
  toastType: string,
  toastName: string,
  toastDescription: string = "",
  disableButton = false,
  arbitraryParams: string = "",
): string => {
  const [nameKey, descriptionKey] = toastKeyMap[toastType];

  let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;

  if (toastDescription) {
    redirectPath += `&${descriptionKey}=${encodeURIComponent(
      toastDescription,
    )}`;
  }

  if (disableButton) {
    redirectPath += `&disable_button=true`;
  }

  if (arbitraryParams) {
    redirectPath += `&${arbitraryParams}`;
  }

  return redirectPath;
};

export const getStatusRedirect = (
  path: string,
  toastName: string,
  toastDescription: string = "",
  disableButton = false,
  arbitraryParams: string = "",
): string => {
  return getToastRedirect(
    path,
    "status",
    toastName,
    toastDescription,
    disableButton,
    arbitraryParams,
  );
};

export const getErrorRedirect = (
  path: string,
  toastName: string,
  toastDescription: string = "",
  disableButton = false,
  arbitraryParams: string = "",
): string => {
  return getToastRedirect(
    path,
    "error",
    toastName,
    toastDescription,
    disableButton,
    arbitraryParams,
  );
};
