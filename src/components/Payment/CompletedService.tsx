import { Button, CircularProgress, Skeleton, Typography } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { FC, useEffect, useState } from 'react';
import { db } from '../../store/firebase';
import { ORDER, clientUID, issuedPayment, status, babeUID } from '../../keys/firestorekeys';
import { useUser } from '../../store';
import shallow from 'zustand/shallow';
import { useTranslation } from 'react-i18next';
import TransferPendingToIncome from '../Dialogs/Payout/Transfer/TransferPendingToIncome';
import { OrderStatusEnum } from '../../enum/OrderEnum';
import FlexGap from '../Box/FlexGap';

interface props {
    reviewId: string | undefined
    orderId: string
    myReviewLinkId: string | undefined
    serviceCompleted?: () => void
    serviceRefunded?: () => void
    getbabeUUID?: (UUID: string) => void
}

const CompletedService : FC<props> = ({reviewId, orderId, myReviewLinkId, serviceCompleted, serviceRefunded, getbabeUUID}) => {

    enum OrderStatus {
        REFUNDED,
        PENDING_REFUND,
        PAID,
        COMPLETED,
        ERROR
    }

    const { t } = useTranslation()

    const [ uid ] = useUser((state) => [
        state.currentUser?.uid
    ], shallow)

    const [isLoadingOrder, setLoadingOrder] = useState<boolean>(false)
    const [isClient, setIsClient] = useState<boolean>(false)
    const [orderStatus, setOrderStatus] = useState<OrderStatus | undefined>()

    const [isOpen, setOpen] = useState<boolean>(false)

    useEffect(() => {

        if(orderId){
            setLoadingOrder(true)

            getDoc(doc(db, ORDER, orderId)).then((snapShot) => {

                const _status = snapShot.get(status) as number
                const _babeUID = snapShot.get(babeUID) as string
                const _clientUID = snapShot.get(clientUID) as string
                const _issuedPayment = snapShot.get(issuedPayment) as boolean
                const isClient = _clientUID === uid

                if(_babeUID){
                    getbabeUUID?.(_babeUID)
                }
    
                if(_status === OrderStatusEnum.completed || _status === OrderStatusEnum.refund_rejected){
                    const st = _issuedPayment ? OrderStatus.PAID : OrderStatus.COMPLETED
                    setOrderStatus(st)
                    if(_issuedPayment){
                        serviceCompleted?.()
                    }
                }else if(_status === OrderStatusEnum.pending_refund){
                    setOrderStatus(OrderStatus.PENDING_REFUND)
                }else if(_status === OrderStatusEnum.refunded){
                    setOrderStatus(OrderStatus.REFUNDED)
                    serviceRefunded?.()
                }else{
                    setOrderStatus(OrderStatus.ERROR)
                }
    
                setIsClient(isClient)
    
            }).finally(() => {
                setLoadingOrder(false)
            })
        }
        // eslint-disable-next-line
    }, [])

    const onClick = () => {
        setOpen(true)
    }

    if (isLoadingOrder) return <Skeleton width="200px" variant='text'/>

    else if(orderStatus === undefined) return <></>

    return <>

            <Typography variant='caption' marginBottom={1}>
                {t("servicecompleted.label")} 
                &nbsp;

                
        </Typography>

        <FlexGap/>

        <Button
            size='small'
            sx={{maxHeight: '16px', minWidth: '50px', minHeight: '16px', textTransform: "none"}}
            disabled={isLoadingOrder || orderStatus !== OrderStatus.COMPLETED}
            variant='contained'
            color={
                orderStatus === OrderStatus.PENDING_REFUND || orderStatus === OrderStatus.REFUNDED
                ? "inherit" : "warning"
            }
            onClick={onClick}
            endIcon={
                <>
                    {
                        orderStatus === OrderStatus.PAID ? 
                        <img width={12} src = "https://images.rentbabe.com/assets/mui/green_tick.svg" alt=""/> : <>
                            {isLoadingOrder && <CircularProgress size={10} />}
                        </>
                    }
                </>
            }>{orderStatus === OrderStatus.PAID  ? "Completed" : 
            orderStatus === OrderStatus.PENDING_REFUND  ? "Under pending refund" : 
            orderStatus === OrderStatus.REFUNDED ? "refunded" : "Yes"}</Button>


        {(isOpen && orderId && reviewId && orderStatus === OrderStatus.COMPLETED) && 
        <TransferPendingToIncome 
            reviewId={reviewId}
            myReviewLinkId={myReviewLinkId}
            orderId={orderId}
            isClient={isClient}
            open={isOpen}
            onCancel={() => {
                setOpen(false)
            }}
            transferCompleted={() => {
                // set completed
                setOpen(false)
                setOrderStatus(OrderStatus.PAID)
                serviceCompleted?.()
            }}
        /> }
    </>
 
}

export default (CompletedService)