import { cleanTitle } from "@/utils/general";

export const downloadToSVG = (svgData: null | Node, title: string) => {
  if (!svgData) return;

  // Serialize the SVG element to get the SVG source code
  const serializer = new XMLSerializer();
  const svgSource = serializer.serializeToString(svgData);

  const svgBlob = new Blob([svgSource], {
    type: "image/svg+xml;charset=utf-8",
  });

  const svgUrl = URL.createObjectURL(svgBlob);
  const downloadLink = document.createElement("a");

  downloadLink.href = svgUrl;
  downloadLink.download = cleanTitle(title).length
    ? cleanTitle(title) + ".svg"
    : "awesome-qr.svg";

  document.body.appendChild(downloadLink);

  downloadLink.click();
  document.body.removeChild(downloadLink);
};
