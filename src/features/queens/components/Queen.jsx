import React from "react";
import { queenSVG } from "../utils/boardUtils.js";

/**
 * Queen SVG piece rendered as an img element with an inline SVG data URL.
 * id attributes are set to match the original DOM-based animation querySelector patterns.
 */
const Queen = React.memo(function Queen({ col, row }) {
  const svgStr = queenSVG(col, row);
  const src = "data:image/svg+xml," + encodeURIComponent(svgStr);
  return (
    <div className="qpiece">
      <img
        className="qsvg"
        id={`qi-${col}`}
        src={src}
        alt={`Queen at column ${col} row ${row}`}
        draggable={false}
      />
    </div>
  );
});

export default Queen;
