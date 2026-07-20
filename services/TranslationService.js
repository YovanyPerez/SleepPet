import en from "../translations/en";
import es from "../translations/es";

export function getTranslations(language) {

  return language === "es"
    ? es
    : en;

}