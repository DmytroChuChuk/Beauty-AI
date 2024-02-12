import { Box, BoxProps } from "@mui/system";
import { logEvent } from "firebase/analytics";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import shallow from "zustand/shallow";
import { StarIcon } from "../../icons/materialUiSvg";
import { AnalyticsNames } from "../../keys/analyticNames";
import "../../scss/components/Buttons/button.scss";
import { useUser } from "../../store";
import { analytics } from "../../store/firebase";
import { Helper } from "../../utility/Helper";
import history from "../../utility/history";

interface props extends BoxProps {
  className?: string;
}

const BabeButton: FC<props> = ({ className = "", ...props }) => {
  const { t } = useTranslation();
  const helper = new Helper();

  const [uid, isAdmin] = useUser(
    (state) => [state.currentUser?.uid, state.currentUser?.isAdmin],
    shallow
  );

  const onClick = () => {
    try {
      logEvent(analytics, AnalyticsNames.buttons, {
        content_type: "babe button",
        item_id: "Babe button",
      });
    } catch {}

    const helper = new Helper();
    const shouldRefresh = helper.getQueryStringValue("babe") !== "true";

    // const _state = sessionStorage.getItem(state).toLowerCase()
    // const _club = sessionStorage.getItem(club).toLowerCase()

    //const url = `/page/Admin?uid=${uid}&babe=true`
    var url = "/page/admission";

    // if(clubName && clubState){
    //     url += `${club}=${_club}&${state}=${_state}`
    // }

    if (shouldRefresh) {
      window.location.href = url;
    } else {
      history.push(url);
    }
  };

  return (
    <Box
      className={`babe-button ${className}`}
      bgcolor={isAdmin === false && uid ? "red" : "black"}
      onClick={onClick}
      width={helper.isMobileCheck2() ? uid ?  "40%":"50%" : "auto"}
      {...props}
    >
      <StarIcon />
      {!uid
        ? t("babe.button")
        : isAdmin === false
        ? "In review"
        : t("babe.button")}
    </Box>
  );
};

export default BabeButton;
