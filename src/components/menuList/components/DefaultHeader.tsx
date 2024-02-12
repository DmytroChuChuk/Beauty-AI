import { Box, CardHeader, Typography } from "@mui/material";
import { logEvent } from "firebase/analytics";
import { FC, version } from "react";
import shallow from "zustand/shallow";
import { AnalyticsNames } from "../../../keys/analyticNames";
import "../../../scss/components/MenuList/DefaultHeader.scss";
import { useUser } from "../../../store";
import { analytics, auth } from "../../../store/firebase";
import { Helper } from "../../../utility/Helper";
import history from "../../../utility/history";
import CenterFlexBox from "../../Box/CenterFlexBox";
import FlexBox from "../../Box/FlexBox";
import FlexGap from "../../Box/FlexGap";
import MyAvatar from "../../Profile/MyAvatar";
import StatusTag from "./StatusTag";

interface props {
  hasOrder: boolean;
  avatarOnClick?: () => void;
}

const DefaultHeader: FC<props> = ({ hasOrder, avatarOnClick }) => {
  const [uid, nickname, isPremium, isAdmin] = useUser(
    (state) => [
      state.currentUser?.uid,
      state.currentUser?.nickname,
      state.currentUser?.isAdmin,
      state.currentUser?.isPremium,
    ],
    shallow
  );

  const goToProfile = () => {
    const helper = new Helper();
    const shouldRefresh = helper.getQueryStringValue("babe") === "true";

    const link = `/page/Admin?uid=${uid}&v=${version}`;

    if (shouldRefresh) {
      window.location.href = link;
    } else {
      history.push(link, { uid: uid, type: 2 });
    }

    avatarOnClick?.();

    try {
      logEvent(analytics, AnalyticsNames.buttons, {
        content_type: "menu to profile",
        item_id: "menu to profile",
      });
    } catch {}
  };

  if (!uid) return null;
  else
    return (
      <FlexBox className="top-logo-content">
        <CardHeader
          sx={{ cursor: "pointer" }}
          onClick={goToProfile}
          avatar={<MyAvatar hasOrder={hasOrder} />}
          title={
            <FlexBox flexDirection={!isPremium && !isAdmin ? "column" : "row"}>
              <Typography> @{nickname}</Typography>
              <FlexGap gap={2} />
              <StatusTag />
            </FlexBox>
          }
          // info?.replace(phoneExp, censor).replace(emailExp, censor)
          subheader={
            <Box>
              {auth.currentUser?.email && (
                <Typography variant="caption">
                  {auth.currentUser?.email.shorten(15)}
                </Typography>
              )}
              {auth.currentUser?.phoneNumber && (
                <>
                  {auth.currentUser?.email && <br />}
                  <Typography variant="caption">
                    {auth.currentUser?.phoneNumber.shorten(15)}
                  </Typography>
                </>
              )}
            </Box>
          }
        />

        <CenterFlexBox
          style={{
            cursor: "pointer",
            width: "100%",
            justifyContent: "flex-end",
          }}
          onClick={goToProfile}
        >
          <img
            style={{ width: "21px", height: "21px" }}
            src="https://images.rentbabe.com/assets/mui/forward_arrow.svg"
            alt=""
          />
        </CenterFlexBox>
      </FlexBox>
    );
};

export default DefaultHeader;
