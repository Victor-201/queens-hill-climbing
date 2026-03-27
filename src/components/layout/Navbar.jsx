import React from "react";
import { Crown } from "lucide-react";

/**
 * App header — mirrors original .hdr / h1 / .hdr-sub
 */
export default function Navbar() {
  return (
    <div className="hdr">
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <Crown size={28} color="#c9993a" strokeWidth={2.5} />
        <span>8-QUEENS HILL CLIMBING</span>
      </h1>
      <div className="hdr-sub">
        Steepest-Ascent · h(n) = số cặp hậu tấn công nhau (hàng + đường chéo)
      </div>
    </div>
  );
}
