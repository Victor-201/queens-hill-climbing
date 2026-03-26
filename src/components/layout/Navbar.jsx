import React from 'react';

/**
 * App header — mirrors original .hdr / h1 / .hdr-sub
 */
export default function Navbar() {
  return (
    <div className="hdr">
      <h1>♛ 8-QUEENS HILL CLIMBING</h1>
      <div className="hdr-sub">
        Steepest-Ascent · h(n) = số cặp hậu tấn công nhau (hàng + đường chéo)
      </div>
    </div>
  );
}
