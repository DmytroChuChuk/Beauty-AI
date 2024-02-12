import React, { MouseEvent, useState, useEffect } from "react";

import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Skeleton
} from "@mui/material";
import {
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import shallow from "zustand/shallow";
import {
  amount,
  club,
  gateway,
  id,
  info,
  moveToWhere,
  orderIdKey,
  orderItem,
  penalty,
  SecurityRangeKey,
  time_stamp,
  uid,
  wiseTransferIdKey
} from '../../../keys/firestorekeys'
import CoinImage from "../../CustomImage/CoinImage";
import FlexGap from "../../Box/FlexGap";
import {
  MovementEnum,
  OrderItemEnum,
  SecurityRange,
  WiseWithdrawStatusEnum,
} from "../../../enum/OrderEnum";
import NotSupportedCard from "../../Card/NotSupportedCard";
import { ClubProps, UserInfoProps } from "../../../keys/props/common";
import { useUser } from "../../../store";
import { DateHelper } from "../../../utility/DateHelper";
import { StringHelper } from "../../../utility/StringHelper";
import { auth } from "../../../store/firebase";

const backEndUrl = process.env.REACT_APP_API_URL;

function getEstimatedForPendingToIncome(range: number, date: Date): string {
  let numberOfDays = 7;

  switch (range) {
    case SecurityRange.fifteenDays: {
      numberOfDays = 7;
      break;
    }

    case SecurityRange.sevenDays: {
      numberOfDays = 5;
      break;
    }

    case SecurityRange.threeDays: {
      numberOfDays = 3;
      break;
    }

    default: {
      break;
    }
  }

  const hours = date.getHours();
  let cache = date;
  cache = DateHelper.addDays(cache, numberOfDays);
  
  if (hours >= 0 && hours < 4) {
    cache.setHours(4, 0, 0, 0);
  } else if (hours >= 4 && hours < 8) {
    cache.setHours(8, 0, 0, 0);
  } else if (hours >= 8 && hours < 12) {
    cache.setHours(12, 0, 0, 0);
  } else if (hours >= 12 && hours < 16) {
    cache.setHours(16, 0, 0, 0);
  } else if (hours >= 16 && hours < 24) {
    cache.setHours(23, 59, 0, 0);
  }

  return cache
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      hour12: true,
    })
    .replace(" at ", ", ");
}

interface Props {
  data: QueryDocumentSnapshot<DocumentData>;
  copyIdClick: () => void;
  checkServiceCompletion: (
    orderId: string,
    myReviewLinkId: string,
    otherReviewLinkId: string,
    whenTransferToIncome: string,
    pendingCreditAmount: number
  ) => void;
  isPageOwner?: boolean;
}

function TransactionCard({
  data,
  copyIdClick,
  checkServiceCompletion,
  isPageOwner = false,
}: Props) {
    interface Struct {
        [amount] : number;
        [gateway]: number;
        [id]: string;
        [orderItem]: number;
        [time_stamp]: Timestamp;
        [uid]: string;
        [moveToWhere]: MovementEnum;
        [SecurityRangeKey]: number;
        [club]: ClubProps;
        [orderIdKey]: string;
        [info]: UserInfoProps | undefined,
        [wiseTransferIdKey]: string | undefined;
        [penalty]: number | undefined;
    }

  const defaultImageManyCoins =
    "https://images.rentbabe.com/assets/logo/manycoins216.png";
  const dataStruct = data.data() as Struct;
  
  const orderId = dataStruct[orderIdKey]
  const [myUID] = useUser((state) => [state.currentUser?.uid], shallow);

  const users = dataStruct[info] ? Object.keys(dataStruct[info]) : [];
  const otherUID = users.find((key) => key !== myUID);
  const myReviewLinkId = StringHelper.getQueryFromStringValue(dataStruct[info]?.[myUID ?? ""]?.link, "sid")
  const otherReviewLinkId = StringHelper.getQueryFromStringValue(dataStruct[info]?.[otherUID ?? ""]?.link, "sid")

  const creditAmount = dataStruct[amount];
  const memberUUID = dataStruct?.[uid];
  const memberUrl = dataStruct[info]?.[memberUUID ?? ""]?.u;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>();
  const open = Boolean(anchorEl);

  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (dataStruct[wiseTransferIdKey] &&  dataStruct[orderItem] === OrderItemEnum.credits_movement && dataStruct[moveToWhere] === MovementEnum.income_to_cash) {
      getEstimatedWiseDeliveryDate(dataStruct[wiseTransferIdKey] ?? '');
    }else if(!dataStruct[wiseTransferIdKey]){

      setEstimatedDelivery(
        `You will receive $$ ${dataStruct[time_stamp].toDate().getEstimatedBankTransferDate()}`
      )
     
    }
    // eslint-disable-next-line 
  }, [dataStruct[wiseTransferIdKey], dataStruct[orderItem], dataStruct[moveToWhere]]);

  // Get estimated delivery date for Wise withdrawals
  const getEstimatedWiseDeliveryDate = async (transferId: string) => {

    try {
      setIsLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(
        `${backEndUrl}/v1/transfers/delivery-estimate/${transferId}`,
        {
          headers: {
              Authorization: `Bearer ${token}`
          }
      }
      );

      const { data } = response.data;

      // If status is refunded
      if (data.status === WiseWithdrawStatusEnum.refunded) {
        setEstimatedDelivery('Transfer refunded');
        setIsLoading(false);
        return;
      }
      
      const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const estimatedDate = new Date(data.estimatedDeliveryDate);
      const today = new Date();

      // If status is sent and 2 days have passed since estimated delivery date
      if (data.status === WiseWithdrawStatusEnum.sent && today.getTime() > estimatedDate.getTime() + 172800000) {
        setEstimatedDelivery('Transfer already completed')
      } else if (data.status === WiseWithdrawStatusEnum.sent) {
        setEstimatedDelivery('Transfer successfully sent to your bank. Keep in mind - it can take up to 2 working days');
      } else {
        // If estimated delivery date is today, show estimated delivery time
        if (estimatedDate.getDate() === today.getDate()) {
          const remainingTime = Math.ceil((estimatedDate.getTime() - today.getTime()) / 60000); // Remaining time in minutes

          if(remainingTime <= 1) {
            // If remaining time is less than 1 minute
            setEstimatedDelivery('Should arrive in seconds');
          }else if (remainingTime < 60) {
            // If remaining time is less than 60 minutes, show remaining time in minutes
            setEstimatedDelivery(`Should arrive in ${remainingTime} minutes`);
          } else {
            // If remaining time is more than 60 minutes, show remaining time in hours
            const remainingHours = Math.ceil(remainingTime / 60);
            setEstimatedDelivery(`Should arrive in ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`);
          }
        } else {
          setEstimatedDelivery(`Should arrive by ${weekday[estimatedDate.getDay()]}, ${estimatedDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric"
          })}`)
        }
      }
      setIsLoading(false);
    } catch (error) {
        console.log(error);
        setEstimatedDelivery('-');
        setIsLoading(false);
    }
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl((<div />) as unknown as HTMLElement);
  };

  function getColor(item: number, creditAmounts: number) {
    switch (item) {
      case OrderItemEnum.transaction: {
        return creditAmounts > 0 ? "success" : "error";
      }

      case OrderItemEnum.refund: {
        return "default";
      }

      case OrderItemEnum.credits_movement: {
        return "default";
      }

      default: {
        return "secondary";
      }
    }
  }

  function getTextColor(item: number, creditAmounts: number) {
    if (item === OrderItemEnum.credits_movement) {
      return "text.secondary";
    }
    return creditAmounts > 0 ? "success.main" : "error.main";
  }

  function getMovementtitle(): string {
    const movement = dataStruct[moveToWhere] ?? 0;

    switch (movement) {
      case MovementEnum.income_to_cash: {
        return "Income Credit convert to Cash.";
      }
      case MovementEnum.pending_to_income: {
        return "Pending Credit moved to Income Credit.";
      }
      default: {
        return "";
      }
    }
  }

  function getCardTitle(item: number): any {
    if (OrderItemEnum.credits_movement === item) {
      const movement = dataStruct[moveToWhere] ?? 0;

      switch (movement) {
        case MovementEnum.income_to_cash: {

          return<>
            <b>
              Withdrawn
            </b>
          </>
        }

        default: {
          return<>
            <b>
              Moved from Pending
            </b>
          </>
        }
      }

      // const red: CSSProperties = { color: "red" };
      // const green: CSSProperties = { color: "green" };

      // return (
      //   <>
      //     <b style={red}>{from}</b>
      //     &nbsp;&nbsp;|&nbsp;&nbsp;
      //     <b style={green}>{to}</b>
      //   </>
      // );
    }
    if (item === OrderItemEnum.transaction) {
      if (creditAmount > 0) {
        return "EARN";
      }
      return "SPEND";
    }

    return OrderItemEnum[item]?.toUpperCase();
  }

  function getSubHeader(
    orderItemId: number,
    moveToWhereId: number,
    creditAmounts: number
  ) {
    if (
      orderItemId === OrderItemEnum.credits_movement &&
      moveToWhereId === MovementEnum.income_to_cash
    ) {
      return (
        <>
        {isLoading ? <Skeleton variant="text" width={200} height={20} /> : estimatedDelivery ? (
          <Typography color="error" variant="caption">{estimatedDelivery}</Typography>
        ) : ''}
        </>
      );
    }
    if (
      orderItemId === OrderItemEnum.transaction &&
      creditAmounts > 0 &&
      dataStruct[SecurityRangeKey] >= 0
    ) {
      return (
        <Typography color="text.secondary" variant="caption">
          {myReviewLinkId && otherReviewLinkId && dataStruct[id] ? (
            <>
              <Typography variant="caption" marginBottom={1}>
                Service completion status: &nbsp;
              </Typography>

              <FlexGap />

              <Button
                size="small"
                sx={{
                  maxWidth: "50px",
                  maxHeight: "16px",
                  minWidth: "50px",
                  minHeight: "16px",
                  textTransform: "none",
                }}
                variant="contained"
                color="inherit"
                onClick={() =>
                  checkServiceCompletion(
                    orderId,
                    myReviewLinkId,
                    otherReviewLinkId,
                    getEstimatedForPendingToIncome(
                      dataStruct[SecurityRangeKey],
                      dataStruct[time_stamp].toDate()
                    ),
                    dataStruct[amount] ?? 0
                  )
                }
              >
                Check
              </Button>
            </>
          ) : (
            <>
              To Credit Income at{" "}
              <b>
                {getEstimatedForPendingToIncome(
                  dataStruct[SecurityRangeKey],
                  dataStruct[time_stamp].toDate()
                )}
              </b>
              .
            </>
          )}
          {/* To Credit Income at <b>{getEstimatedForPendingToIncome(_data[SecurityRangeKey], _data[time_stamp].toDate())}</b>. */}
        </Typography>
      );
    }
    if (orderItemId === OrderItemEnum.transaction && creditAmounts < 0) {
      return myReviewLinkId && otherReviewLinkId && dataStruct[id] ? (
        <>
          <Typography variant="caption" marginBottom={1}>
            Service completion status: &nbsp;
          </Typography>

          <FlexGap />

          <Button
            size="small"
            sx={{
              maxWidth: "50px",
              maxHeight: "16px",
              minWidth: "50px",
              minHeight: "16px",
              textTransform: "none",
            }}
            variant="contained"
            color="inherit"
            onClick={() =>
              checkServiceCompletion(
                orderId,
                myReviewLinkId,
                otherReviewLinkId,
                getEstimatedForPendingToIncome(
                  dataStruct[SecurityRangeKey],
                  dataStruct[time_stamp].toDate()
                ),
                dataStruct[amount] ?? 0
              )
            }
          >
            Check
          </Button>
        </>
      ) : (
        <Typography fontSize={10} color="text.secondary" variant="caption">
          Transaction ID: {data.id}
        </Typography>
      );
    }
    if (creditAmounts > 0) {
      return (
        <Typography color="text.secondary" variant="caption">
          {getMovementtitle()}
        </Typography>
      );
    }
    return (
      <Typography fontSize={10} color="text.secondary" variant="caption">
        Transaction ID: {data.id}
      </Typography>
    );
  }

  if (
    (dataStruct[orderItem] !== undefined &&
      OrderItemEnum[dataStruct[orderItem]] === undefined) ||
    (dataStruct[moveToWhere] !== undefined &&
      MovementEnum[dataStruct[moveToWhere]] === undefined)
  )
    return <NotSupportedCard height={120} />;

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar
            sx={{ bgcolor: "black", cursor: isPageOwner ? "pointer" : "none" }}
            src={
              isPageOwner
                ? memberUrl ?? defaultImageManyCoins
                : defaultImageManyCoins
            }
            onClick={() => {
              if (isPageOwner && memberUrl && memberUUID) {
                window.open(
                  `${window.location.origin}/Profile?uid=${memberUUID}`,
                  "_blank"
                );
              }
            }}
          />
        }
        title={
          <Box display="flex" alignItems="center">
            <Typography
              fontWeight={900}
              color={getTextColor(dataStruct[orderItem], creditAmount)}
            >
              {creditAmount > 0 &&
              dataStruct[orderItem] !== OrderItemEnum.credits_movement
                ? "+"
                : ""}

              {dataStruct[orderItem] === OrderItemEnum.credits_movement && (
                <>
                  <img
                    width={14}
                    height={14}
                    src="https://images.rentbabe.com/assets/mui/inout.svg"
                    alt=""
                  />
                  &nbsp;
                </>
              )}

              {(creditAmount / 100).toFixed(2)}

              {dataStruct[penalty] ? ` (Penalty: ${(dataStruct[penalty] / 100).toFixed(2)})` : ''}
            </Typography>

            <FlexGap gap={2} />

            {dataStruct[orderItem] !== OrderItemEnum.credits_movement && (
              <CoinImage imageWidth={24} />
            )}
          </Box>
        }
        subheader={
          <Box height="40px">
            {getSubHeader(
              dataStruct[orderItem],
              dataStruct[moveToWhere],
              dataStruct[amount]
            )}
            <br />
          </Box>
        }
        action={
          <div>
            <IconButton onClick={handleClick}>
              <img
                className="pointer"
                src="https://images.rentbabe.com/assets/mui/more_vert_black_24dp.svg"
                alt=""
              />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={copyIdClick}>
                <Typography>Copy ID</Typography>
              </MenuItem>
            </Menu>
          </div>
        }
      />

      <Box padding="10px 16px 10px 16px" display="flex">
        <Box>
          <Typography fontWeight={800} color="text.secondary" variant="caption">
            {dataStruct[time_stamp].toDate().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </Typography>

          {dataStruct[club] &&
            dataStruct[club].name &&
            dataStruct[amount] > 0 &&
            dataStruct[orderItem] === OrderItemEnum.transaction && (
              <Typography color="text.secondary" variant="caption">
                - 10% to @{dataStruct[club].name}
              </Typography>
            )}
        </Box>

        <Chip
          size="small"
          sx={{ marginLeft: "auto" }}
          label={
            <Typography fontSize={10} fontWeight={900}>
              {getCardTitle(dataStruct[orderItem])}
            </Typography>
          }
          color={getColor(dataStruct[orderItem], dataStruct[amount])}
        />
      </Box>
    </Card>
  );
}

TransactionCard.defaultProps = {
  isPageOwner: false,
};

export { TransactionCard };
