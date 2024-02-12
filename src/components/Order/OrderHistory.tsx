import { FC, useEffect, useState } from 'react';

import { useUser } from '../../store';
import { collection, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../store/firebase';
import { babeUID, clientUID, ORDER, status, time_stamp } from '../../keys/firestorekeys';
import { Grid, Typography } from '@mui/material';
import { ListChildComponentProps } from 'react-window';
import SkeletonOrderCard from './component/SkeletonOrderCard';
import WindowList from '../List/WindowList';
import { useWindowSize } from '../../hooks/useWindowSize';
import CenterFlexBox from '../Box/CenterFlexBox';
import OrderCard from './component/OrderCard';
import EmptyHistory from './component/EmptyHistory';
import { useCollectionQuery2 } from '../../chats/hooks/useCollectionQuery2';
import { Helper } from '../../utility/Helper';
import { RBAC } from '../../enum/MyEnum';
import { ServiceType } from '../../keys/props/services';
import { OrderStatusEnum } from '../../enum/OrderEnum';

const OrderHistory : FC = () =>  {

    const defaultLimitCount = 5;

    const [isAdmin, _uid, userRBAC ] = useUser((state) => [
        state?.currentUser?.isAdmin,
        state?.currentUser?.uid,
        state?.currentUser?.userRBAC
    ])

    const helper = new Helper()
    const isAdminPage = helper.getQueryStringValue("admin") === "true" && userRBAC === RBAC.admin
    const isRefund = helper.getQueryStringValue("refund") === "true"
    const meetupOrderId = helper.getQueryStringValue("meetup")
    const emeetOrderId = helper.getQueryStringValue("emeet")
    const faceToFace = helper.getQueryStringValue("f2f") === "true"
    const faceToFaceCompleted = helper.getQueryStringValue("f2f") === "completed"

    const [ size ] = useWindowSize()

    const [limitCount, setLimitCount] = useState(defaultLimitCount);
    const { loading, data, error, hasNextPage } = useCollectionQuery2(_uid ? `${_uid}-session` : undefined,
    isAdminPage ?

    isRefund ?

    query(collection(db, ORDER), 
    where(status, "==", OrderStatusEnum.pending_refund),
    limit(limitCount)) 
    
    :

    faceToFace ? 
    query(collection(db, ORDER), 
    where(`services.serviceType` , "==", ServiceType.meetup),
    orderBy(time_stamp, "desc"),
    limit(limitCount)) 

    :

    faceToFaceCompleted ? 
    query(collection(db, ORDER), 
    where(status , "==", OrderStatusEnum.completed),
    where(`services.serviceType` , "==", ServiceType.meetup),
    orderBy(time_stamp, "desc"),
    limit(limitCount)) 

    :

    meetupOrderId ? 
    query(collection(db, ORDER), 
    where(`services.id` , "==", meetupOrderId),
    where(`services.serviceType` , "==", ServiceType.meetup),
    orderBy(time_stamp, "desc"),
    limit(limitCount)) 
    :
    emeetOrderId ? 
    query(collection(db, ORDER), 
    where(status , "==", OrderStatusEnum.completed),
    where(`services.serviceType` , "==", ServiceType.eMeet),
    orderBy(time_stamp, "desc"),
    limit(limitCount)) 
    :
    query(collection(db, ORDER), 
    orderBy(time_stamp, "desc"),
    limit(limitCount)) 
    
    : 

    query(collection(db, ORDER), 
    where(isAdmin ? babeUID : clientUID, "==", _uid),
    orderBy(time_stamp, "desc"),
    limit(limitCount)), limitCount)

    const Row  = ({index, style} : ListChildComponentProps) => {

        const doc = data?.docs[index]
    
        if(!doc) return  <div key={index} style={style}>
                <SkeletonOrderCard/>
            </div>
    
        return <div key={index} style={style}>
    
           <OrderCard
                data={doc}
           />
    
        </div>
      }


    function loadNextPage() {

        if(hasNextPage){
            setLimitCount((prev) => {
              return prev + defaultLimitCount
            })
        }
    }

    //prevent double scrolling
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "auto";
        }
    })
     
    if(loading) return <CenterFlexBox >
        <Grid maxWidth={500} width="95vw"  container direction="column" rowSpacing={1}>
            {
                [0,0,0,0,0].map((_, index) => {

                    return <Grid key={index} item>
                        <SkeletonOrderCard/>
                    </Grid>
                })
            }

        </Grid>
    </CenterFlexBox>

    else if (error) return <Typography>
        Error, cannot load table
    </Typography>

    else if (data?.size as number === 0)  return <EmptyHistory 
        title='No order yet...'
    />

    else return <WindowList 
        height={size.height - 32}
        width={ size.width * 0.95 > 550 ? 550 : size.width * 0.95 }
        hasNextPage={hasNextPage}
        dataSize={data?.size as number}
        loadNextPage={loadNextPage}
        component={Row}
        itemSize={userRBAC === RBAC.admin ? 180 : 160}
    />
}

export default (OrderHistory)
