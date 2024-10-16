import { cleanTitle } from "@/utils/general";

export const downloadToSVG = (svgData: null | Node, title: string) => {
  if (!svgData) return;

  const clonedSvg = svgData.cloneNode(true) as SVGElement;

  // Set width to match ViewBox
  clonedSvg.setAttribute("width", "31");
  clonedSvg.setAttribute("height", "31");

  // Adjust Stroke Width for all paths
  clonedSvg.querySelectorAll("path").forEach((path) => {
    path.setAttribute("stroke-width", "1");
  });

  // Add a Style Tag to Ensure Stroke Width is Applied
  const styleTag = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "style",
  );
  styleTag.textContent = `path { vector-effect: non-scaling-stroke; }`;
  clonedSvg.insertBefore(styleTag, clonedSvg.firstChild);

  // Serialize the SVG element to get the SVG source code
  const serializer = new XMLSerializer();
  const svgSource = serializer.serializeToString(clonedSvg);

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
