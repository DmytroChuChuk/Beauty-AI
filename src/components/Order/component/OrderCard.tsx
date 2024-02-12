import { 
    FC, useState
} from 'react';

import { 
    id, 
    babeUID, 
    clientUID, 
    chat_room_id, 
    gateway, 
    nickname, 
    price,
    status,
    time_stamp,
    url,
    info,
    short_link,
    SecurityRangeKey,
    issuedPayment,
    reject_reason,
    reason,
    reject_reason_after,
} from '../../../keys/firestorekeys';

import { Avatar, Box, Card, CardHeader, Chip, Typography } from '@mui/material';
import { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { useUser } from '../../../store';
import shallow from 'zustand/shallow';
import { OrderStatusEnum } from '../../../enum/OrderEnum';
import CountDown from '../../Timer/CountDown';

import SessionMore from './SessionMore';
import MobileTooltip from '../../Tooltip/MobileTooltip';
import FlexGap from '../../Box/FlexGap';
import { useTranslation } from 'react-i18next';
import CenterFlexBox from '../../Box/CenterFlexBox';
import history from '../../../utility/history';
import { RBAC } from '../../../enum/MyEnum';
import { minutesToExpire, version } from '../../../version/basic';
import FlexBox from '../../Box/FlexBox';
import { OrderStruct } from '../../../keys/props/FirestoreStruct';

interface props {
    data: QueryDocumentSnapshot<DocumentData>
}

const OrderCard : FC<props> = ({data}) => {

    const {t} = useTranslation()
    const [ myUID, userRBAC  ] = useUser((state) => [
        state.currentUser?.uid,
        state.currentUser?.userRBAC
    ], shallow)

    const orderCardData = data.data() as OrderStruct
    const isClient = orderCardData[clientUID] === myUID
    const myOrderCardUUID = isClient ? orderCardData[babeUID] : orderCardData[clientUID] 
    const myOrderCardUsername = orderCardData[info]?.[myOrderCardUUID]?.[nickname] as string | undefined

    const [hasExpired, setExpired] = useState<boolean>(false)

    function getColor (orderStatus: number) {
        
        switch (orderStatus) {
            case OrderStatusEnum.completed:
                return "warning"

            case OrderStatusEnum.rejected:
                return "error"

            case OrderStatusEnum.refund_rejected:
                return "error"
            
            case OrderStatusEnum.cancel:
                return "error"
        
            default:
                return "default";
        }
    }

    const typography = (title: string) => {
        return   <Typography fontSize={10} fontWeight={900}>
                {title}
        </Typography>
    }

    return <Card>

        <CardHeader
            avatar={
                <Avatar
                    sx={{cursor: "pointer"}}
                    onClick = {() => window.open( `/page/Profile?uid=${myOrderCardUUID}`, "") }
                    src={orderCardData[info]?.[myOrderCardUUID]?.[url] }
                >
                    { myOrderCardUsername?.[0]?.toUpperCase() }
                </Avatar>
            }

            title={`${myOrderCardUsername?.capitalize()}`}
            subheader={<div>
                <Typography variant='caption' color="text.secondary">
                    Final price: {(orderCardData[price] / 100).toFixed(2)} CREDIT
                </Typography>
            </div>}

            action={<Box display="flex">

                {
                    (orderCardData[babeUID] === myUID || userRBAC === RBAC.admin)
                    && orderCardData[status] === OrderStatusEnum.completed
                    && orderCardData[SecurityRangeKey] !== undefined 
                    && orderCardData[issuedPayment] === false
                    &&
                    <>
                    <MobileTooltip title={
                        
                        <Typography variant='body2' whiteSpace="pre-line">
                            {t("credit.pending")}</Typography>
                        
                    }>

                        <img 
                            src={`https://images.rentbabe.com/assets/mui/timer/timer${orderCardData[SecurityRangeKey]}.svg`}
                            alt=""
                        />

                    </MobileTooltip>
                    <FlexGap/>
            
                    </>
                    
                } 
   
                {
                    orderCardData[babeUID] === myUID &&
                    orderCardData[issuedPayment] &&
                    <CenterFlexBox>
                        <MobileTooltip
                            title="Pending Credit has moved to Income Credit."
                        >
                            <img 
                                width={24}
                                height={24}
                                src={`https://images.rentbabe.com/assets/mui/paid.svg`}
                                alt=""
                            />
                        </MobileTooltip>
    
                    </CenterFlexBox>
                }  

                {   
                    orderCardData[status] === OrderStatusEnum.pending 
                    && myUID ===  orderCardData[clientUID] 
                    ? <Chip
                        size='small'
                        disabled={hasExpired}
                        label={typography("Pay now")}
                        color="secondary"
                        onClick={() =>
                            history.push(`/page/checkout?id=${orderCardData[id]}&v=${version}`)
                            // window.open( `${window.location.origin}/page/checkout?id=${_data[id]}`, "_blank")
                        }
                    /> : <SessionMore 
                        id={orderCardData[id]}
                        userInfo = {orderCardData[info]}
                        link={orderCardData[info]?.[myOrderCardUUID]?.[short_link]}
                        gateway={orderCardData[gateway]}
                        timeStamp={orderCardData[time_stamp]}
                        users={Object.keys(orderCardData[info] ?? {})}
                        status={orderCardData[status]}
                        rejectedRefundReason={orderCardData[reject_reason_after]}
                        requestRefundBy={ Object.keys( orderCardData[reject_reason] ?? {}) }
                        requestedRefund={orderCardData[reject_reason]}
                    />
                }
            </Box>
            }
        />
            <Box margin="32px 16px 8px 16px" display="flex">
                <Box display="flex" flexDirection="column">

                {userRBAC === RBAC.admin && <FlexBox>

                    <Typography 
                        color="text.secondary" 
                        variant='caption'
                        fontSize={10}>
                            <a 
                            rel="noreferrer" 
                                href={`${window.location.origin}/chatview?cri=${orderCardData[chat_room_id]}`} 
                                target="_blank"
                            >ChatRoomID: { orderCardData[chat_room_id] }</a>
                    </Typography>

                    {
                       ( orderCardData[reject_reason] && Object.values(orderCardData[reject_reason]).length > 0 ) && 
                       Object.values(orderCardData[reject_reason]).map((value) => {
                        return             <Typography 
                        color="text.secondary" 
                        variant='caption'
                        fontSize={10}>
                            {t("rejected.reason")}: {value?.[reason]}
                            <a 
                            rel="noreferrer" 
                                href={value?.[url]}
                                target="_blank"
                            >Evidence</a>

                        </Typography>
                       })
                    }



                </FlexBox> 
                }

                <Typography 
                    color="text.secondary" 
                    variant='caption'
                    fontSize={10}>
                    Order ID: {orderCardData[id]}
                </Typography>

               <Typography 
                color="text.secondary" 
                variant='caption'
               >
                <b>{!(orderCardData[status] === OrderStatusEnum.pending && !hasExpired) &&
                    orderCardData[time_stamp].toDate().toLocaleString("en-US", {
                        month: "short", day: "numeric", 
                        hour: "numeric", minute: "numeric", hour12: true
                    })
                }</b>

                { (orderCardData[status] === OrderStatusEnum.pending && !hasExpired) && 
                    
                    <span>Order expired in <CountDown
                      hasExpired={() => setExpired(true)}
                      minutesToExpire={minutesToExpire} 
                      date={ (data?.get(time_stamp) as Timestamp)?.toDate() }/>
                    </span> 
                }
                
               </Typography>
               </Box>

                <Chip 
                    size='small' 
                    sx={{marginLeft: "auto"}} 
                    label={ 
                        typography( `${ hasExpired ? "EXPIRED" : 
                        (orderCardData[reject_reason] && Object.keys(orderCardData[reject_reason]).find(key => key === myUID) && orderCardData[status] === OrderStatusEnum.completed) 
                        ? "REFUND REJECTED" 
                        : OrderStatusEnum[ orderCardData[status] ]?.toUpperCase()}`)
                    } 
                    color={getColor(orderCardData[status])} 
                />
            </Box>

            
 

    </Card>
 
}

export default OrderCard