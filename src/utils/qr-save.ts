import { cleanTitle } from "@/utils/general";

const outlineSVG = async (svgElement: SVGElement) => {
  const clonedSVG = svgElement.cloneNode(true) as SVGElement;
  const svgString = new XMLSerializer().serializeToString(clonedSVG);

  try {
    const response = await fetch(`https://170.64.215.144:3000/outline-svg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        svg: svgString,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch outline SVG");
    }

    const { outlinedSVG } = await response.json();
    return outlinedSVG;
  } catch (error) {
    console.error("Error outlineSVG:", error);
    return svgString;
  }
};

export const downloadToSVG = async (svgData: null | Node, title: string) => {
  if (!svgData) return;

  const cloneData = svgData.cloneNode(true) as SVGElement;
  cloneData.querySelector("path")!.setAttribute("stroke-width", "1");

  // Serialize the SVG element to get the SVG source code
  const serializer = new XMLSerializer();
  const svgSource = serializer.serializeToString(cloneData);

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
