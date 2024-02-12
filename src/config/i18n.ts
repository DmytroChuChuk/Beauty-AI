import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translate } from "../keys/localStorageKeys";
import { resources } from "../locales/resources";

// (window.location.host ?? document.URL).split('.').pop() ?? 'en'

// console.log("a".slice(0, 2))

i18n.use(initReactI18next).init({

    lng: localStorage.getItem(translate) ?? navigator.language?.slice(0, 2) ?? 'en',
    supportedLngs: ["en", "id", "zh", "th", "es"],
    fallbackLng: "en",
    resources: resources,
    react: {useSuspense: false},
    interpolation: {
        escapeValue: false,
    }
})

export default i18n;

//. "/assets/locales/{{lng}}/{{ns}}.json"