import React, { useState } from "react";

import { NavLink } from "react-router-dom";

import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  MenuItem,
  Typography,
} from "@mui/material";
import shallow from "zustand/shallow";

import { area, pageArea } from "../../keys/localStorageKeys";
import { useClubAdmin, useUser } from "../../store";
import { Helper } from "../../utility/Helper";

import CountriesDialog from "../Dialogs/Rent/CountriesDialog";
import SocialMedias from "../SocialMedias";

//import history from '../../Utility/history'
import { version } from "../../version/basic";

import MuiListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import { logEvent } from "firebase/analytics";
import { useTranslation } from "react-i18next";
import { iconImageSize } from "../../dimensions/basicSize";
import { RBAC } from "../../enum/MyEnum";
import { useWindowSize } from "../../hooks/useWindowSize";
import { SignOutIcon } from "../../icons/materialUiSvg";
import { AnalyticsNames } from "../../keys/analyticNames";
import { TelegramLink } from "../../keys/contactList";
import { club, state } from "../../keys/firestorekeys";
import "../../scss/components/MenuList.scss";
import { analytics } from "../../store/firebase";
import history from "../../utility/history";
import { BabeButton, LoginButton } from "../Buttons";
import SubscribeButton from "../Buttons/Subscribe";
import SignOutDialog from "../Dialogs/SignOutDialog";
import BasicMenuItem from "../Profile/BasicMenuItem";
import DefaultHeader from "./components/DefaultHeader";
import MenuHeader from "./components/MenuHeader";
//import {  state } from '../../keys/firestorekeys';

interface MenuListProps {
  hasOrder: boolean;
  handleClose: () => void;
  // anchor: any;
  // toggleDrawer: (anchor: any, open: boolean, event: any) => void;
}

const MenuList: React.FC<MenuListProps> = ({
  hasOrder,
  handleClose,
  // anchor,
  // toggleDrawer,
}) => {
  const clubName = sessionStorage.getItem(club);
  const clubState = sessionStorage.getItem(state);
  const [openLogout, setLogout] = useState<boolean>(false);

  const { t, i18n } = useTranslation();
  const [size] = useWindowSize();

  const addClassData: {
    [key: string]: number;
  } = {
    es: 490,
    th: 490,
    en: 370,
    zh: 385,
    id: 460,
  };
  const babeFontSize: {
    [key: string]: number;
  } = {
    es: 2.8,
    en: 2.4,
    th: 2.4,
    zh: 3.8,
    id: 1.8,
  };
  const helper = new Helper();
  const [showAlert, setShowAlert] = useState(false);

  const standard = [
    // "rent.menulist",
    // "messages.menulist",

    "terms.menulist",
    "FAQ.menulist",
    "location.menulist",
    "contactus.menulist",
  ];

  const closeCountryDialog = () => {
    setShowAlert(false);
    handleClose();
  };
  const logoutClick = () => {
    setLogout(true);
  };
  const openCountryDialog = () => {
    try {
      logEvent(analytics, AnalyticsNames.buttons, {
        content_type: "menulist location",
        item_id: "menulist location",
      });
    } catch {}

    setShowAlert(true);
  };

  const [uid, isAdmin, userRBAC] = useUser(
    (state) => [
      state.currentUser?.uid,
      state.currentUser?.isAdmin,
      state.currentUser?.userRBAC,
    ],
    shallow
  );

  const [clubsRBAC] = useClubAdmin(
    (state) => [state.current?.clubRBAC],
    shallow
  );

  const shouldChangeFontSize =
    size.width < (addClassData[i18n.language] ?? 420) - (uid ? 150 : 0);
  const addClassName = shouldChangeFontSize ? "resize-button-text" : "";

  const goToPremium = () => {
    helper.upgradePremium(uid);
    handleClose();
    // toggleDrawer(anchor, false, null);
  };
  const ListItemText = styled(MuiListItemText)({
    "& .MuiListItemText-primary": {
      color: "#1A1A1A",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "20px",
    },
  });

  const pageOwnerClick = () => {
    window.location.href = `/dashboard?v=${version}`;
  };

  const myTalentPageOnClick = () => {
    window.location.href = `/talents?v=${version}`;
  };

  const verifyClick = () => {
    window.location.assign("/page/rent?admin=true&verify=true");
    handleClose();
  };

  const allOrderClick = () => {
    history.push("/trade?admin=true");
    handleClose();
  };

  const admissionClick = () => {
    window.location.href = "/page/Rent?admin=true";

    handleClose();
  };

  const allChatsClick = () => {
    window.location.href = "/allchats";

    handleClose();
  };

  return (
    <div>
      <DefaultHeader
        hasOrder={hasOrder}
        avatarOnClick={() => {
          handleClose();
          // toggleDrawer(anchor, false, null);
        }}
      />

      {!isAdmin && (
        <Box className="section-2-container" padding="16px">
          {uid ? (
            <div className="signed-button">
              <SubscribeButton
              sx={{
                fontSize: shouldChangeFontSize
                  ? `${babeFontSize[i18n.language]}vw!important`
                  : "",
              }}
                onClick={() => {
                  goToPremium();
                }}
              />
              {helper.isMobileCheck2() && <BabeButton
                sx={{
                  fontSize: shouldChangeFontSize
                    ? `${babeFontSize[i18n.language]}vw!important`
                    : "",
                    minWidth: "100px"
                }}
              />}
            </div>
          ) : null}
          <div className="signin-button">
            {!uid && (
              <BabeButton
                sx={{
                  fontSize: shouldChangeFontSize
                    ? `${babeFontSize[i18n.language]}vw!important`
                    : "",
                }}
                marginRight={!uid ? ".5rem" : "-4px"}
              />
            )}
            {!uid && <LoginButton className={addClassName} />}
          </div>
        </Box>
      )}

      {uid && <MenuHeader hasOrder={hasOrder} />}

      <List sx={{ cursor: "pointer" }}>
        {uid && (
          <>
            <Divider variant="middle" />
            <ListItem
              //remove padding
              onClick={(e: any) => {
                const isAnnouncement =
                  helper.getQueryStringValue("session") !== "";

                if (isAnnouncement) {
                  window.location.href = `/page/${"rent"}`;
                }
                handleClose();

                // toggleDrawer(anchor, false, e);
              }}
              component={NavLink}
              to={"/page/rent"}
              key={"rent"}
            >
              {/* <ListItemIcon>{getIcon(num)}</ListItemIcon> */}

              <ListItemText>
                <Typography variant="h2">{"Rent"}</Typography>
              </ListItemText>
            </ListItem>
          </>
        )}
        <Divider variant="middle" />
        {standard.map((name: string, num: number) => {
          const index = num; //menuList.length > standard.length ? num - (menuList.length - standard.length) : num

          const array = name.split(":");

          const key = array[0];
          //const _state = array.length > 1 ? array[1] : (sessionStorage.getItem(state) ?? "")

          const text = t(key);

          const enText =
            (
              i18n.getResource("en", "translation", key) as string
            )?.toLowerCase() ?? key.toLowerCase();
          if (index === 2)
            return (
              <ListItem onClick={openCountryDialog} key={index}>
                <Typography variant="h2">{text}</Typography>
              </ListItem>
            );
          if (index === 3)
            return (
              <ListItem
                onClick={(e: any) => window.open(TelegramLink, "_blank")}
                key={index}
              >
                {/* <ListItemIcon>{getIcon(num)}</ListItemIcon> */}
                <ListItemText>
                  <Typography variant="h2">{text}</Typography>
                </ListItemText>
              </ListItem>
            );
          else
            return (
              <ListItem
                onClick={(e: any) => {
                  if (index === 0) {
                    const isAnnouncement =
                      helper.getQueryStringValue("session") !== "";

                    if (isAnnouncement) {
                      window.location.href = `/page/${enText}`;
                    }
                  }
                  handleClose();
                  // toggleDrawer(anchor, false, e);
                }}
                component={NavLink}
                to={index === 0 && !uid ? "/login" : `/page/${enText}`}
                key={index}
              >
                <div className="flex align-center">
                  <ListItemText>
                    <Typography variant="h2">{text}</Typography>
                  </ListItemText>
                </div>
              </ListItem>
            );
        })}

        <Divider variant="middle" />

        {userRBAC === RBAC.admin && (
          <BasicMenuItem
            title="Admission"
            iconImageSize={iconImageSize}
            imageUrl="https://images.rentbabe.com/assets/admin/admin_lock.svg"
            onClick={admissionClick}
          />
        )}

        {userRBAC === RBAC.admin && (
          <BasicMenuItem
            title="All Chats"
            iconImageSize={iconImageSize}
            imageUrl="https://images.rentbabe.com/assets/mui/chatbubble.svg"
            onClick={allChatsClick}
          />
        )}

        {userRBAC === RBAC.admin && (
          <BasicMenuItem
            title="All Order"
            iconImageSize={iconImageSize}
            imageUrl="https://images.rentbabe.com/assets/mui/order.svg"
            onClick={allOrderClick}
          />
        )}

        {userRBAC === RBAC.admin && (
          <BasicMenuItem
            title="Verification"
            iconImageSize={iconImageSize}
            imageUrl="https://images.rentbabe.com/assets/flaticon/card.svg"
            onClick={verifyClick}
          />
        )}

        {clubsRBAC === RBAC.admin && (
          <>
            <BasicMenuItem
              title="Dasboard"
              iconImageSize={iconImageSize}
              imageUrl="https://images.rentbabe.com/assets/mui/inout.svg"
              onClick={pageOwnerClick}
            />
            <BasicMenuItem
              title="My Talents"
              iconImageSize={iconImageSize}
              imageUrl="https://images.rentbabe.com/assets/mui/emoji_emotions.svg"
              onClick={myTalentPageOnClick}
            />
            <Divider />
          </>
        )}

        {uid && (
          <MenuItem onClick={logoutClick} key={"signout"}>
            <div className="signout">
              <ListItemIcon>
                <SignOutIcon />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="h2">{t("signout.button")}</Typography>
              </ListItemText>
            </div>
          </MenuItem>
        )}
      </List>

      <Box className="section-2-container" padding="16px">
        <div className="btm-wrapper">
          <div className="version">
            <p>{version}</p>
            <p>hello@RentBabe.com</p>
          </div>
          <footer className="btm-container">
            <SocialMedias />
          </footer>
        </div>
      </Box>

      <CountriesDialog
        keepMounted
        open={showAlert}
        onClose={closeCountryDialog}
        value={
          localStorage.getItem(clubName && clubState ? pageArea : area) ??
          "Singapore"
        }
      />
      <SignOutDialog onClose={() => setLogout(false)} open={openLogout} />
    </div>
  );
};

export default MenuList;
