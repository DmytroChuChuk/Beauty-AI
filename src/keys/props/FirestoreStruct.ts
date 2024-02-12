import { Timestamp } from 'firebase/firestore';
import { ServiceDetails } from '../../pages/ProfilePage';
import { 
    id, 
    babeUID, 
    clientUID, 
    chat_room_id, 
    gateway, 
    nickname, 
    origin, 
    price,
    stripeConnectAccount,
    sessionId,
    status,
    time_stamp,
    url,
    info,
    SecurityRangeKey,
    issuedPayment,
    services,
    reject_reason,
    reject_reason_after,
} from '../firestorekeys';

import { UserInfoProps, RequestRefundProps } from './common';

export interface OrderStruct {
    [id]: string
    [babeUID]: string,
    [chat_room_id]: string,
    [clientUID]: string,
    [gateway]: number,
    [nickname]: string,
    [origin]: string,
    [price]: number,
    [stripeConnectAccount]: string
    [sessionId]: string,
    [status]: number,
    [time_stamp]: Timestamp,
    [url]: string,
    [SecurityRangeKey]: number,
    [issuedPayment]: boolean,
    [services]: ServiceDetails,
    [info]: UserInfoProps | undefined,
    [reject_reason]: RequestRefundProps | undefined,
    [reject_reason_after]: UserInfoProps | undefined
}
