import { cleanTitle } from "@/utils/general";

export const downloadToSVG = (svgData: null | Node, title: string) => {
  if (!svgData) return;

  // Clone SVG Node
  const svgClone = svgData.cloneNode(true) as SVGElement;

  // Convert strokes to fills
  svgClone.querySelectorAll("path").forEach((path) => {
    const strokeWidth = parseFloat(path.getAttribute("stroke-width") || "1");
    const strokeColor = path.getAttribute("stroke") || "black";

    path.setAttribute("fill", strokeColor);
    path.removeAttribute("stroke");
    path.removeAttribute("stroke-width");

    // Adjust path to account for stroke width
    const d = path.getAttribute("d");

    if (d) {
      const pathData = d.split(" ");
      const x = parseFloat(pathData[0]);
      const y = parseFloat(pathData[1]);
      const width = parseFloat(pathData[2]);
      const height = parseFloat(pathData[3]);

      const newX = x + strokeWidth / 2;
      const newY = y + strokeWidth / 2;
      const newWidth = width - strokeWidth;
      const newHeight = height - strokeWidth;

      path.setAttribute(
        "d",
        `M ${newX} ${newY} h ${newWidth} v ${newHeight} h -${newWidth} Z`,
      );
    }
  });

  // Serialize modified SVG element to get the SVG source code
  const serializer = new XMLSerializer();
  const svgSource = serializer.serializeToString(svgClone);

  const svgBlob = new Blob([svgSource], {
    type: "image/svg+xml;charset=utf-8",
  });

  const svgUrl = URL.createObjectURL(svgBlob);
  const downloadLink = document.createElement("a");

  downloadLink.href = svgUrl;
  downloadLink.download = cleanTitle(title).length
    ? cleanTitle(title) + ".svg"
    : "code-from-qrmory.svg";

  document.body.appendChild(downloadLink);

  downloadLink.click();
  document.body.removeChild(downloadLink);
};
