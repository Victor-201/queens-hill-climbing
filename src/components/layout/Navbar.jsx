import React from "react";
import { Crown } from "lucide-react";
import { useLang } from "../../context/LanguageContext.jsx";
import LanguageSwitcher from "../LanguageSwitcher.jsx";

export default function Navbar() {
  const { t } = useLang();
  return (
    <div className="hdr">
      <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        <Crown size={28} color="#c9993a" strokeWidth={2.5} />
        <span>{t('title')}</span>
      </h1>
      <div className="hdr-sub">{t('subtitle')}</div>
      <div style={{ position: "absolute", top: "50%", right: "18px", transform: "translateY(-50%)" }}>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
