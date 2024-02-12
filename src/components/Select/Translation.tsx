import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent
} from "@mui/material";
import { logEvent } from "firebase/analytics";
import { FC, useState } from "react";
import { AnalyticsNames } from "../../keys/analyticNames";
import { translate } from "../../keys/localStorageKeys";
import { analytics } from "../../store/firebase";

interface props {
  className?: string;
  onChange: (value: string) => void;
}

const inputDivStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "5px",
};
const languageArray = [{
  value: "en",
  img: "http://purecatamphetamine.github.io/country-flag-icons/3x2/GB.svg",
  name: "EN"
},
{
  value: "zh",
  img: "http://purecatamphetamine.github.io/country-flag-icons/3x2/CN.svg",
  name: "中文"
},
{
  value: "es",
  img: "http://purecatamphetamine.github.io/country-flag-icons/3x2/ES.svg",
  name: "Español"
},
{
  value: "id",
  img: "http://purecatamphetamine.github.io/country-flag-icons/3x2/ID.svg",
  name: "INDO"
},
{
  value: "th",
  img: "http://purecatamphetamine.github.io/country-flag-icons/3x2/TH.svg",
  name: "ภาษาไทย"
},
]

const Translation: FC<props> = ({ className = "", onChange }) => {
  const [lang, setLang] = useState(
    localStorage.getItem(translate) ?? navigator.language?.slice(0, 2) ?? "en"
  );

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setLang(value);
    onChange(value);
    localStorage.setItem(translate, value);

    try {
      logEvent(analytics, AnalyticsNames.buttons, {
        content_type: `filter ${value}`,
        item_id: `filter ${value}`,
      });
    } catch {}
  };

  return (
    <FormControl variant="standard" color="secondary" sx={{ m: 1, minWidth: 94 }} >
      <Select
    
        className={className}
        variant="standard"
        value={lang}
        disableUnderline
        onChange={handleChange}
      >
        {languageArray.map((item, index) => (
          <MenuItem key={index} value={item.value}>
            <div style={inputDivStyle}>
              <img
                src={item.img}
                alt={item.name}
                style={{ width: "20px", height: "20px", borderRadius: "8px" }}
              />
              <span>{item.name}</span>
            </div>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default Translation;
