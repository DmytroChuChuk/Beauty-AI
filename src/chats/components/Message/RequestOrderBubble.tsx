
import { deleteField, doc, Timestamp, updateDoc } from "firebase/firestore";
import { FC, useRef, useEffect, useContext, useState} from "react";
import dayjs from "dayjs";
import '../../styles/Messages.scss'
import LastSeen from "./LastSeen";
import { VariableWindowListContext } from "../../../components/List/VariableWindowList";

import CenterFlexBox from "../../../components/Box/CenterFlexBox";
import { Avatar, Box, Button, CardHeader, CircularProgress, Typography } from "@mui/material";
import FlexGap from "../../../components/Box/FlexGap";
import { db, functions } from "../../../store/firebase";
import { CONVERSATION, 
    MESSAGES, 
    reject_reason, 
    status as statusKey, 
    messageId as messageIdKey, 
    chat_room_id,
    pay_link} from "../../../keys/firestorekeys";
import { cardGray } from "../../../keys/color";
import CenterSnackBar from "../Snackbar/CenterSnackBar";
import { httpsCallable } from "firebase/functions";
import { stripeCheckOutV6Function } from "../../../keys/functionNames";
import { useUser } from "../../../store";
import { ServiceDetails } from "../../../pages/ProfilePage";
import { ServicesHelper } from "../../../utility/ServicesHelper";
import { CancelRejectProps, ClubProps } from "../../../keys/props/common";
import history from "../../../utility/history";
import { useTranslation } from "react-i18next";
import CountDown from "../../../components/Timer/CountDown";
import { minutesToExpire } from "../../../version/basic";
import { CancelOrReject } from "../../../enum/MyEnum";
import { mobileWidth } from "../../../dimensions/basicSize";

export enum option {
    pending, accept, reject, paid
}

interface props {
    babeUID: string | undefined
    babeProfileImage: string | undefined
    clientProfileImage: string | undefined
    sender: string | undefined
    showProfileImage: boolean
    index: number
    chatRoomID: string
    messageId : string
    msg: string
    isMine: boolean
    seen: boolean
    createdAt: Timestamp
    status: option
    rejectedReason?: string
    order: any
    link: string | undefined
    serviceDetails?: ServiceDetails | undefined
    club?: ClubProps | undefined
    requestNewOrder: () => void
    openGovDialog: () => void
    onRejectCancel: (data: CancelRejectProps) => void
}

const RequestOrderBubble: FC<props> = ({ 
    babeUID, 
    babeProfileImage, 
    clientProfileImage, 
    sender,
    showProfileImage,
    status, 
    rejectedReason, 
    index, 
    chatRoomID, 
    messageId, 
    seen, 
    msg, 
    isMine, 
    createdAt, 
    order,
    link,
    serviceDetails,
    club,
    requestNewOrder, 
    openGovDialog,
    onRejectCancel
}) => {

    const { t } = useTranslation()
    const serviceHelper = new ServicesHelper()
    
    const [
        isAdmin, 
        myNickname, 
        verified
    ] = useUser((state) => [
        state.currentUser?.isAdmin,
        state.currentUser?.nickname,
        state.currentUser?.verified
    ])

    const root1 = useRef<HTMLDivElement>(null)
    const { size, setSize } = useContext(VariableWindowListContext)
    const currentWidth = size?.width ?? 0
    const withSideName = currentWidth > mobileWidth ? "sidebar" : "nosidebar"

    const [payLink, setPayLink] = useState<string | undefined>(link)

    const today = new Date()
    const diffMs = today.getTime() - createdAt.toDate().getTime()
    const diffMins = Math.round(diffMs / 60000)

    const isPending = status === option.pending 

    const [counter, setCounter] = useState(0)
    const [hasExpired, setExpired] = useState<boolean>(diffMins > minutesToExpire)

    const [loadingAccept, setAccept] = useState<boolean>(false)

    const [alert, setAlert] = useState<boolean>(false)
    const [alertMsg, setMsg] = useState<string>()

    const name = isMine ? "recipient" : "sender"

    function openAlert(msg: string) {
        setAlert(true)
        setMsg(msg)
    }

    function formatDate (date: Date){
        const formatter = dayjs(date)
        return formatter.format("h:mm A")
    }

    const revertToAcceptReject = async () => {
        setAccept(true)

        await updateDoc(doc(db, CONVERSATION, chatRoomID, MESSAGES, messageId), {
            [statusKey]: option.pending,
            [reject_reason]: deleteField()
        })

        setAccept(false)
        setCounter(0)
    }

    const incrementCounter = (data: CancelRejectProps) => () => {
        // setCounter(1)

        onRejectCancel(data)
    }

    const acceptOrder = async () => {
        if(!verified){
            // open government issued it
            openGovDialog()
            return
        }

        if(!isAdmin){
            history.push(`/page/admission`)
            return
        }

        if(!order) {
            openAlert("Error, cannot find order")
            return
        }

        setAccept(true)

        // send checkout link payment
        
        // send quote price
        const stripeCheckOut = httpsCallable(functions, stripeCheckOutV6Function)

        order.messageId = messageId

        if(club){
            order.club = club
        }

        try{

            const res = await stripeCheckOut(order)

            const data = res.data as any
            const link = data.link as string

            setPayLink(link)
            setAccept(false)

        }catch(error){
            console.log(error)
            setAccept(false)
            openAlert(`${error}`)
        }

    }

    useEffect(() => {
        const height1 =  root1.current?.getBoundingClientRect().height ?? 0
        setSize?.(index, height1);
    }, [size?.width, hasExpired, status]) // eslint-disable-line
    

    const undo = () => {
        setCounter(0)
        // setAcceptCounter(0)
    }

    return  <div ref={root1} className={`chat-bubble-wrapper ${isMine ? 'isMine' : ''}`}>

        {showProfileImage && <Box>
            <a 
                href={`${window.location.origin}/Profile?uid=${sender}`} 
                target="_blank" 
                rel="noreferrer">
            <img 
                width={80}
                height={80}
                src={clientProfileImage}
                alt=""
            />
        </a>

        <FlexGap/>

        <a 
            href={`${window.location.origin}/Profile?uid=${babeUID}`} 
            target="_blank" 
            rel="noreferrer">
            <img 
                width={80}
                height={80}
                src={babeProfileImage}
                alt=""
            />
        </a>

        </Box>}
        
        <div className={`wrapper-helper ${withSideName}`}>

            <div className={`chat-bubble ${name} ${withSideName}`}>

                {
                    serviceDetails?.details && <CardHeader
                        avatar = {
                            <Avatar
                                variant="rounded"
                                src={serviceDetails?.details?.image}
                            />
                        }
                        title={serviceDetails?.details?.title}
                        subheader={<Typography>
                            {((serviceDetails?.details?.price ?? 0)/100)?.toFixed(2)}/
                            {serviceHelper.convertUnits(serviceDetails?.details?.suffix)}
                        </Typography>}
                    /> 
                }


                { (hasExpired && status === option.pending) || (hasExpired && status === option.accept) ? 
                <Typography fontWeight="bold" color="inherit">{ isMine ? t("confirm.again") :  t("order.expired") }</Typography> 
                : <span className="msg" dangerouslySetInnerHTML={{ __html: msg.replace("ORDER REQUEST", "<b>ORDER REQUEST</b>")
                .bubbleMessage() }}/>}

                <div className={`timing-${name}`}>
                    <LastSeen chatRoomID={chatRoomID} 
                    messageId={messageId} 
                    isMine={isMine} seen={seen} formattedDate={formatDate(createdAt.toDate())}/>
                </div>
            </div>

            {
                (isPending&& !hasExpired) && <>
                {(isMine) ?
                    <Box display="flex" width="100%" flexDirection="column">

                        <CenterFlexBox flexDirection="row">
                                <Button
                                    sx={{marginTop: ".5rem"}} 
                                    onClick={incrementCounter({
                                        [chat_room_id]: chatRoomID,
                                        [messageIdKey]: messageId,
                                        [pay_link]: link,
                                        [statusKey]: CancelOrReject.CANCEL
                                    })}
                                    variant="contained"  
                                    fullWidth 
                                    color="error"
                                >
                                    {t("cancel") }
                            </Button>
                        </CenterFlexBox>

                        <Typography color="text.secondary" marginLeft="auto" marginRight={1} variant="caption">
                            {t("wait.user.respond")}&nbsp;<CircularProgress color="secondary" size={10}/>                      
                        </Typography>

                    </Box> 

                    : <CenterFlexBox marginBottom="8px">
        
                    {counter === 0 && <Button 
                        name="reject-button"
                        sx={{textTransform: "none"}}
                        variant="contained"
                        fullWidth 
                        color="error"
                        //disabled = {loadingAccept || loadingReject || !reason} 
                        onClick={incrementCounter({
                            [chat_room_id]: chatRoomID,
                            [messageIdKey]: messageId,
                            [pay_link]: link,
                            [statusKey]: CancelOrReject.REJECT
                        })}
                    >{t("reject")}</Button> }

                    {counter > 0 && <Button
                        name = "undo-button"
                        sx={{width: 100}} 
                        onClick={undo}
                        variant="contained"  
                        fullWidth 
                        color="inherit"
                        >
                        {t("undo")}
                    </Button>}
                    
                    <FlexGap/>

                    {counter === 0 && <Button 
                        name= "accept-button"
                        fullWidth
                        sx={{textTransform: "none"}} 
                        variant="contained" 
                        color="success" 
                        // disabled = {loadingAccept || loadingReject || (!reason && counter > 0)} 
                        onClick={() => {
                            setCounter(1)
                        }}
                    >{t("accept")}</Button>}

                    {counter > 0 && <Button 
                        name= "confirm-button"
                        fullWidth
                        sx={{textTransform: "none"}} 
                        variant="contained" 
                        color="warning"
                        disabled = {loadingAccept} 
                        onClick={acceptOrder}
                        endIcon={
                            loadingAccept && <CircularProgress size={12} color="secondary"/>
                        }
                    >{t("confirm")}</Button> }

                </CenterFlexBox>}
                </>
            }

            {status === option.reject && 
            <CenterFlexBox 
                className={`buttons ${withSideName}`}
                width="100%"
                sx={{
                    marginBottom: "1rem",
                    marginLeft: isMine ? "auto" : "0",
                    marginRight: !isMine ? "auto" : "0"
                }} 
                padding="1rem"
                bgcolor={cardGray} 
                borderRadius={4} 
                flexDirection="column"
            >
                <Typography fontWeight="bolder" color="error.main" variant="body2"> ORDER REJECTED</Typography>
                <Typography variant="caption">{rejectedReason}</Typography>
            
                {isMine ? <>
                    <br/>
                    <Button 
                        sx={{textTransform: "none"}}
                        onClick={requestNewOrder} 
                        variant="contained" 
                        color="warning">Request an new order
                    </Button>
                </> : <> { 
                (rejectedReason && rejectedReason.split(" ").length > 0 && rejectedReason.split(" ")[0].toLowerCase() === myNickname) &&
                
                <Box marginTop={2} display="flex">
                    
                <Button 
                    sx={{textTransform: "none"}}
                    onClick={revertToAcceptReject} 
                    variant="contained" 
                    color="inherit">
                    {t("undo")}
                </Button>

                </Box>}

                </>}

            </CenterFlexBox>}

            {
                status === option.accept && <Box
                display="flex" 
                flexDirection="column"
                width="100%"
                >
                    {!hasExpired && <Box display="flex" 
                    alignItems="center">

                    <Button
                        sx={{textTransform: "none"}}
                        variant="contained" 
                        color="error"
                        onClick={incrementCounter({
                            [chat_room_id]: chatRoomID,
                            [messageIdKey]: messageId,
                            [pay_link]: link,
                            [statusKey]: CancelOrReject.CANCEL
                        })}
                    >{t("cancel")}</Button>

                    <FlexGap/>

                    {
                        isMine ? <Button 
                            fullWidth
                            sx={{
                                textTransform: "none",
                                marginLeft: isMine ? "auto" : "0",
                                marginRight: !isMine ? "auto" : "0"
                            }} 
                            // href={payLink} 
                            onClick={() => {if(payLink){
                                const id = payLink.getQueryStringValue("id")
                                history.push(`/page/checkout?id=${id}`)
                            }}}
                            variant="contained" 
                            color="success"
                        >
                          {t("make.payment")}
                        </Button> : 
                        <>
                            <Typography fontWeight="bold" color="error" variant="caption">
                            {t("order.not.confirm")}
                            </Typography>
                        </>

                    }

                    </Box>}


                    { isMine && <Typography
                        color="text.secondary"
                        textAlign={isMine ? "right" : "left" }
                        variant="caption"
                    >
                        {!hasExpired && `${t("pay.to.chat")}`}
                    </Typography> }
                    

                </Box>
            }

            {
                (status === option.accept && !isMine) && 
                    <Typography color="text.secondary" 
                    variant="caption">{!hasExpired && "Waiting for payment."}
                </Typography>
            }

            {
                (status === option.paid) && <Box
                    className="buttons"
                    sx={{
                        width: "100%",
                        marginLeft: isMine ? "auto" : "0",
                        marginRight: !isMine ? "auto" : "0",
                    }}>

                   <Button
                    fullWidth   
                    onClick={() => {
                        const orderCheckOutId = payLink.getQueryStringValue("id")
                        
                        window.open(`/page/checkout?id=${orderCheckOutId}`, "_blank")
                    }}
                    variant="contained"
                    color="error" 
                    sx={{
                        width: "100%"
                    }}
                    >
                    PAYMENT SUCCESS
                </Button>
                </Box>
            }

            {option.accept === status && <Box
                display="flex" 
                flexDirection="column"
                width="100%">

            <Typography 
            textAlign={isMine ? "right" : "left" }
            color="text.secondary" variant="caption"> 

                {!hasExpired && `${t("expires.in")} `}<CountDown
                    hasExpired={
                        () => {
                            setExpired(true)
                        }
                    }
                    minutesToExpire={minutesToExpire} 
                    date={ createdAt?.toDate() }/>
            </Typography>

            </Box>}
        </div>

        <CenterSnackBar
            open={alert}
            message={alertMsg}
            onClose={() => setAlert(false)}
            autoHideDuration={2000}
        />

    </div>


    
}

export default RequestOrderBubble;