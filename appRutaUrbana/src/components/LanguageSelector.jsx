import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    const language = event.target.value;
    i18n.changeLanguage(language);
    localStorage.setItem("rutaUrbanaLanguage", language);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 130 }}>
      <InputLabel id="language-selector-label">
        {t("language.label")}
      </InputLabel>

      <Select
        labelId="language-selector-label"
        value={i18n.language}
        label={t("language.label")}
        onChange={handleLanguageChange}
      >
        <MenuItem value="es">{t("language.spanish")}</MenuItem>
        <MenuItem value="en">{t("language.english")}</MenuItem>
      </Select>
    </FormControl>
  );
}