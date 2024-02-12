import {
  Avatar,
  Badge,
  Box,
  CardHeader,
  CircularProgress,
  Menu,
  Skeleton,
  Typography
} from "@mui/material";
import { FC, MouseEvent, useState, version } from "react";
import history from "../../../utility/history";
import CenterFlexBox from "../../Box/CenterFlexBox";
import FlexBox from "../../Box/FlexBox";

import { logEvent } from "firebase/analytics";
import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { ListChildComponentProps } from "react-window";
import shallow from "zustand/shallow";
import { useCollectionQuery } from "../../../chats/hooks/useCollectionQuery";
import {
  HistoryIcon,
  OrderIcon,
  WalletIcon,
} from "../../../icons/materialUiSvg";
import { AnalyticsNames } from "../../../keys/analyticNames";
import { HISTORY, USERS, time_stamp } from "../../../keys/firestorekeys";
import { HistoryProps } from "../../../keys/props/common";
import { useUser } from "../../../store";
import { analytics, db } from "../../../store/firebase";
import WindowList from "../../List/WindowList";
interface props {
  hasOrder?: boolean;
  title: string;
  icon: JSX.Element | undefined;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
}

const Row = ({
  index,
  style,
  data,
}: ListChildComponentProps<QueryDocumentSnapshot<DocumentData>[]>) => {
  const historyData = data?.[index]?.data() as HistoryProps | undefined;

  if (!historyData)
    return (
      <div key={index} style={style}>
        <CardHeader
          sx={{ marginRight: "0px!important" }}
          avatar={
            <Skeleton sx={{ width: 42, height: 42 }} variant="circular" />
          }
          title={<Skeleton width={50} variant="text" />}
          subheader={<Skeleton width={80} variant="text" />}
        />
      </div>
    );

  const goToProfile = () => {
    try {
      logEvent(analytics, AnalyticsNames.buttons, {
        content_type: "history button",
        item_id: "history button",
      });
    } catch {}

    window.open(`/page/Profile?uid=${historyData.uid}`, "_blank");
  };

  return (
    <Box key={index} sx={style}>
      <CardHeader
        sx={{ marginRight: "0px!important", cursor: "pointer" }}
        onClick={goToProfile}
        avatar={
          <Avatar
            sx={{
              width: "42px!important",
              height: "42px!important",
            }}
            variant="circular"
            src={historyData?.u}
            alt=""
          ></Avatar>
        }
        title={historyData?.nick}
        subheader={
          <Typography color="text.secondary" variant="caption">
            {(historyData.t as Timestamp | undefined)
              ?.toDate()
              ?.timeSince(true)}
          </Typography>
        }
        action={
          <img
            width={19}
            src="https://images.rentbabe.com/assets/mui/open_in_new.svg"
            alt=""
          />
        }
      />
    </Box>
  );
};

const MenuHeaderItem: FC<props> = ({
  hasOrder = false,
  title,
  onClick,
  icon,
}) => {
  return (
    <CenterFlexBox sx={{ cursor: "pointer" }} onClick={onClick} width="100%">
      <Badge overlap="circular" badgeContent={hasOrder ? "!" : 0} color="error">
        <FlexBox alignItems="center" flexDirection="column">
          {icon}
          <Typography 
          marginTop={1}
           variant="h2">
            {title}
          </Typography>
        </FlexBox>
      </Badge>
    </CenterFlexBox>
  );
};

const HistoryMenu: FC<{
  open: boolean;
  anchorEl: any;
  handleClose: () => void;
}> = ({ open, anchorEl, handleClose }) => {
  const height = 350;
  const width = 250;
  const limitNumber = 5;
  const [limitCount, setLimitCount] = useState<number>(limitNumber);

  const [uid] = useUser((state) => [state.currentUser?.uid], shallow);

  const { loading, data, hasNextPage } = useCollectionQuery(
    uid ? `H-${uid}` : undefined,
    uid
      ? query(
          collection(db, HISTORY, uid, USERS),
          orderBy(time_stamp, "desc"),
          limit(limitCount)
        )
      : undefined,
    limitCount
  );

  function loadNextPage() {
    if (hasNextPage) {
      setLimitCount((prev) => {
        return prev + limitNumber; // calculateChats()  //10
      });
    }
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 1.5,
          "& .MuiAvatar-root": {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          "&:before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: "background.paper",
            transform: "translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {loading ? (
        <CenterFlexBox height={height} width={width}>
          <CircularProgress size={12} color="secondary" />
        </CenterFlexBox>
      ) : (data?.length ?? 0) > 0 ? (
        <WindowList
          itemData={data ?? []}
          height={height}
          width={width}
          hasNextPage={hasNextPage}
          dataSize={data?.length as number}
          loadNextPage={loadNextPage}
          component={Row}
          itemSize={64}
        />
      ) : (
        <CenterFlexBox height={height} width={width}>
          <Typography variant="caption">Empty history result.</Typography>
        </CenterFlexBox>
      )}
    </Menu>
  );
};

const MenuHeader: FC<{ hasOrder: boolean; onClick?: () => void }> = ({
  hasOrder,
  onClick,
}) => {
  const [t] = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const historyClick = (event: MouseEvent<HTMLDivElement>) => {
    // open menu
    setAnchorEl(event.currentTarget);
  };

  const walletClick = () => {
    onClick?.();
    history.push(`/wallet?v=${version}`);
  };

  const orderClick = () => {
    onClick?.();
    history.push(`/trade?v=${version}`);
  };

  return (
    <CenterFlexBox marginTop={1} marginBottom={1} marginRight={1}>
      <FlexBox width="100%">
        <MenuHeaderItem
          hasOrder={false}
          title={t("wallet.tab")}
          onClick={walletClick}
          icon={<WalletIcon />}
        />

        <MenuHeaderItem
          hasOrder={hasOrder}
          title={t("order.tab")}
          onClick={orderClick}
          icon={<OrderIcon />}
        />

        <MenuHeaderItem
          title={t("history.tab")}
          onClick={historyClick}
          icon={<HistoryIcon />}
        
        />

        {open && (
          <HistoryMenu
            open={open}
            anchorEl={anchorEl}
            handleClose={handleClose}
          />
        )}
      </FlexBox>
    </CenterFlexBox>
  );
};

export default MenuHeader;
