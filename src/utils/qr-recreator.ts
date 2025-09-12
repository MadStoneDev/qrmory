// utils/qr-recreator.ts

/**
 * Function to recreate a QR code value from saved content data
 *
 * @param content The saved content data from the database
 * @returns The recreated QR code value string
 */
export const recreateQRValue = (content: any): string => {
  if (!content || !content.controlType) {
    return "";
  }

  try {
    switch (content.controlType) {
      case "website":
        return `${content.protocol}://${content.url}`;

      case "facebook":
        return `facebook.com/${content.username}`;

      case "instagram":
        return `instagram.com/${content.username}`;

      case "twitter":
        return `${content.domain}/${content.username}`;

      case "youtube":
        return `${content.linkFormat}${content.videoId}`;

      case "text":
        return content.text;

      case "wifi":
        return `WIFI:T:${content.encryption};S:${content.ssid};P:${
          content.password
        }${content.hidden ? ";H:true" : ""};`;

      case "vcard":
        // For VCard, we need to recreate the encoded URL
        const vcardData = {
          n: content.fullName,
          org: content.company,
          email: content.email,
          tel: content.phone,
          url: content.website,
          title: content.position,
          ts: new Date().getTime(), // Add timestamp to prevent caching issues
        };
        const jsonStr = JSON.stringify(vcardData);
        const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));
        return `https://qrmory.com/vcard/${encodedData}`;

      case "coupon":
        // For Coupon, we need to recreate the encoded URL
        const couponData = {
          title: content.title,
          discount: content.discount,
          type: content.type,
          desc: content.desc,
          cta: content.cta,
          color: content.colour,
          theme: content.theme,
          exp: content.exp,
          biz: content.biz,
          ts: new Date().getTime(), // Add timestamp to prevent caching issues
        };
        const couponJsonStr = JSON.stringify(couponData);
        const couponEncodedData = btoa(
          unescape(encodeURIComponent(couponJsonStr)),
        );
        return `https://qrmory.com/coupon/${couponEncodedData}`;

      case "location":
        if (content.isManual) {
          // Manual coordinates
          return `geo:${content.lat},${content.lng}`;
        } else if (content.name) {
          // Location with name
          const encodedName = encodeURIComponent(content.name);
          return `geo:${content.lat},${content.lng}?q=${encodedName}`;
        }
        return `geo:${content.lat},${content.lng}`;

      default:
        return "";
    }
  } catch (error) {
    console.error("Error recreating QR value:", error);
    return "";
  }
};
