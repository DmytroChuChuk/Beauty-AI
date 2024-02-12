import React, { ChangeEvent, useEffect, useState } from 'react';

import { 
  Avatar,
  Box, 
  Button, 
  ButtonProps, 
  Card, 
  CardContent, 
  CardHeader, 
  Chip, 
  CircularProgress, 
  Divider, 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  Skeleton, 
  Typography 
} from '@mui/material';

import {loadStripe} from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
} from '@stripe/react-stripe-js';


import LinearProgress from '@mui/material/LinearProgress';
import { Helper } from '../../utility/Helper';

import CenterFlexBox from '../Box/CenterFlexBox';
import CoinImage from '../CustomImage/CoinImage';
import { doc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../store/firebase';
import { ORDER, time_stamp, CONVERSATION, chat_room_id } from '../../keys/firestorekeys';
import { useConversationStore, useSelectedConversation, useUser } from '../../store';
import GetCreditBalance from '../Coin/Wallet/components/hooks/GetCreditBalance';
import CountDown from '../Timer/CountDown';
import SendCreditDialog from '../Dialogs/Credit/SendCreditDialog';
import LoginPage from '../../pages/LoginPage';
import { OrderStruct } from '../../keys/props/FirestoreStruct';
import Conversation from '../../utility/Conversation';
import { useWindowSize } from '../../hooks/useWindowSize';
import history from '../../utility/history';
import { isTEST } from '../../keys/functionNames';
import { minutesToExpire } from '../../version/basic';
import { OrderStatusEnum } from '../../enum/OrderEnum';
import {  TypographyProps } from '@mui/system';

enum payment {
  credit = 0,
  stripe = 1
}

interface checkoutButtonProps extends ButtonProps {
  title: string
  selectPayment: number 
  sessionId: string | undefined
  openSendCreditDialog: () => void
}

const CheckoutButton : React.FC<checkoutButtonProps> = ({title, selectPayment, sessionId, openSendCreditDialog, ...props}) => {

  const stripe = useStripe();

  var handleResult = function(result : any) {
    if (result.error) {
        console.log(result.error.message);
    }else{
    }
  };

  return   <Button 
    {...props}
    sx={{marginLeft: "auto"}} 
    onClick={() => {
   
    switch (selectPayment) {
      case payment.stripe:

        if(sessionId){
        
          stripe?.redirectToCheckout({
            sessionId: sessionId

          }).catch(handleResult)
        }
        break;
    
      case payment.credit:

        // send payment to user now...
        openSendCreditDialog()

        break;

    }

  }} variant="contained" color="warning">{title}</Button>
};

interface StatusProps extends TypographyProps {
  title: string,
  color: string
} 
const CheckoutStatus: React.FC<StatusProps> = ({
  title,
  color,
  ...props
}) => {
    return <Typography
    sx={{marginLeft: "auto"}} 
    gutterBottom 
    variant="h5"
    fontWeight="bolder" 
    component="div"
    color={color}
    {...props}
    >
      {title}
    </Typography>
}

const StripeCheckout: React.FC = () => {


  const [myUID, userRBAC, isBlock] = useUser((state) => [
    state.currentUser?.uid, 
    state.currentUser?.userRBAC,
    state.currentUser?.isBlock
  ])
  const setSelectedConversation = useSelectedConversation((state) => state.setSelectedConversation)
  
  const helper = new Helper()


  const key = isTEST ? 'pk_test_Wy45sQqUs0fLxhB6Z87PfAUf' : 'pk_live_2MGVUBzqFSWgJgPK1G5sUXqv'
  const stripePromise = loadStripe(key)

  // eslint-disable-next-line 
  const [_, sizeRef] = useWindowSize()
  const [currentConversation] = useConversationStore((state) => [state.currentConversation])

  const [loadingChat, setLoadingChat] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [hasExpired, setExpired] = useState<boolean>(false)
  const [cantFound, setFound] = useState<boolean>(false)
  const [creditBalance, setBalance] = useState<number | null>(null)
  const [selectPayment, setPayment] = useState<number>(payment.credit)

  const [openSendCredit, setOpenSendCredit] = useState<boolean>(false)
  const [data, setData] = useState<OrderStruct | undefined>()

  const notEnough = (creditBalance ?? 0) < (data?.pr as number)

    useEffect(() => {
      if(hasExpired){
        setOpenSendCredit(false)
      }
    }, [hasExpired])

    useEffect(() => {

      const id = helper.getQueryStringValue("id")

      if(!id) return
 
      const unsub = onSnapshot(doc(db, ORDER, id), (snapShot) => {
    
        setLoading(false)

        if(!snapShot.exists()){

          setFound(true)

        }else{
          const today = new Date()
          const timeStamp = snapShot.get(time_stamp) as Timestamp
          const diffMs = today.getTime() - timeStamp.toDate().getTime()
          const diffMins = Math.round(diffMs / 60000);

          if(diffMins > minutesToExpire){
            setExpired(true)
          }

          setData(snapShot.data() as OrderStruct)

        }
      }, () => {
        setLoading(false)
        setFound(true)
      })

      return () => {
        unsub()
      }

        // eslint-disable-next-line
    }, [])

    const radioGroupOnChange = (event: ChangeEvent<HTMLInputElement>, value: string) => {
      setPayment(parseInt(value))
    }

    const onHandleCreditBalance = (value:number) => {
      setBalance(value)
    }

    const onCloseHandle = () => {
      setOpenSendCredit(false)
    }

    const chatOnClick = async () => {


      const chatRoomId = data?.cri
      if(!chatRoomId) return

      setLoadingChat(true)

      const convoHelper = new Conversation()

      const document = convoHelper.getExistingConvoById(currentConversation, chatRoomId) ?? await getDoc(doc(db, CONVERSATION, chatRoomId))

      const conversation = convoHelper.convertDocToConvo(document)
      setSelectedConversation({data: conversation})

      // if(sizeRef.current.width > 620) history.push(`./Chat?${chat_room_id}=${_doc.id}`, conversation)
      // else history.push('./chatbox', conversation)

      const pathName = sizeRef.current.width > 620 ? "chat" : "chatbox"
      history.push(`./${pathName}?${chat_room_id}=${document.id}`, conversation)

      setLoadingChat(false)
    }

    const openProfile = () => {
      if(!data) return

      const uid = data?.cuid === myUID ? data.buid : data.cuid

      window.open(`${window.location.origin}/Profile?uid=${uid}`, "_blank")
    }

    if(isBlock) return <></>

    if(!myUID) return <LoginPage/>

    else if( (cantFound || ( data?.cuid !== myUID && data?.buid !== myUID && !userRBAC )) && !loading) return <CenterFlexBox height="100vh">

        <Typography>Error, not found</Typography>
    
    </CenterFlexBox>

   else  return <Box className='chat-background' height = "100vh" >

        <Box display="flex" justifyContent="center" paddingTop="10%">

          <Card sx={{minWidth: 350, width: "70%", maxWidth: 1200, position: "relative"}}>


          <Button sx={{position: "absolute", right: 0, top: 10}}>
            <img onClick={() => history.goBack()} height = {32} width = {32} src = "https://images.rentbabe.com/assets/mui/close_rounded.svg" alt="" />
          </Button>

          {loading && <LinearProgress color='warning'/>}


          {data?.st !== OrderStatusEnum.completed && <CardContent>

              {data?.st === OrderStatusEnum.error ? <>
                <Typography color="error.main" variant="h5" component="div">ERROR NOT PAID</Typography>
                <Typography color="error.main" variant="caption" component="div">please checkout again</Typography>
              </> : <Typography 
              color="text.primary"
              variant="h5" component="div">
                Confirm Payment
              </Typography>
              } 

              {
              (data?.buid as string) === myUID
                && <Box margin={1}>
                  <Typography variant='caption' color="error.main">READ ONLY | This order is not for you</Typography>
                </Box>
              }

          </CardContent>}

          {
            loading ? <CardHeader
              avatar ={
                <Avatar 
                variant='rounded'
                sx={{width: 100, height: 100}}
              >
                <Skeleton variant='rectangular' width={100} height={100}/>
              </Avatar>}

              title={<Skeleton variant='text' width="100px"/>}
              subheader={ 
                <CardHeader
                avatar={
                  <Avatar
                  variant='circular'
                  sx={{width: 38, height: 38}}
                  >
                    <Skeleton variant='circular'/>
                  </Avatar>
                }
                subheader={<Skeleton variant='text' width="50px"/>}
              />
              }
              
              >
               
                <Skeleton variant='rectangular' height={150} width="100%"/>
              </CardHeader>
              :

              <CardHeader
                avatar ={
                  <Avatar 
                    variant='rounded'
                    src={data?.services?.details?.image ?? "https://images.rentbabe.com/assets/rentblogo.svg"}
                    sx={{width: 100, height: 100}}
                    onClick={openProfile}
        
                  />
                }
                title={
                  <CardHeader
                    avatar={
                      <Avatar src={myUID === data?.cuid ? data?.inf?.[data.buid]?.u?.toCloudFlareURL() 
                        : data?.inf?.[data.cuid]?.u?.toCloudFlareURL() }
                      onClick={openProfile}
                      sx={{cursor: "pointer"}}
                      />
                    }
                    subheader={<Box display="flex" flexDirection="column">
                  
                      <Typography variant='caption'>{myUID === data?.cuid ?
                      data?.inf?.[data.buid]?.nick?.capitalize() :
                      data?.inf?.[data.cuid]?.nick?.capitalize() 
                      
                      }</Typography>

                      {data?.cri && <Chip  sx={{width: 58}} size="small" color="warning" label={
                        <Typography variant='caption'>
                          Chat  {loadingChat && <CircularProgress color="primary" size={8}/>}
                        </Typography>
                      } onClick={chatOnClick}/> }

                    </Box>}
                  />
                }
              /> 
            }

            
            <CardContent>


              <Box>

                  
              <GetCreditBalance 
                fontSize={24}
                creditBalance={onHandleCreditBalance}
              />
              {loading ? 
                  <Skeleton variant='text' width={100} height={16} />
                : <Typography variant="caption" fontSize={10} color="text.secondary">
                  My credit balance | <a href={`/credit?funnel=${window.location.href}`}><Typography 
                  color="secondary.main" 
                  variant="caption" 
                  fontSize={12} 
                  fontWeight={600}>Recharge</Typography></a>
                </Typography>
              }

              </Box>

              <br/>

              <Divider/>

              <br/>
              
              <Box>

              {data?.st === OrderStatusEnum.pending && <>
                {
                  data?.t ?  <>

                    <Typography variant="caption" color="text.secondary">
                      Please make payment in <CountDown
                      hasExpired={() => {
                        setExpired(true)
                      }}
                      minutesToExpire={minutesToExpire} 
                      date={ (data?.t as Timestamp)?.toDate() }/>
                
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      , otherwise the order will be cancelled automatically
                    </Typography>

                  </> : <Typography variant="caption" color="text.secondary"><Skeleton width={480} variant="text" /> </Typography>

                }
              
              
              </>}


              </Box>

              <FormControl>
                
                <RadioGroup
                    onChange={radioGroupOnChange}
                    defaultValue={payment.credit}
                >
                  <FormControlLabel 
                    value={payment.credit} 
                    disabled ={loading || creditBalance === null || creditBalance < (data?.pr as number) || data?.st === OrderStatusEnum.completed} 
                    control={<Radio color="warning" icon={creditBalance === null ? <CircularProgress size={12} color= "warning"/> : undefined} /> } 
                    label={`RentBabe Credit ${ notEnough ? "(Not Enough)" : "" }`}
                  />

                  {/* {data?.sessionId && <FormControlLabel 
                  disabled ={loading || data?.st as number === sessionStatus.paid} 
                  value={payment.stripe} 
                  control={<Radio 
                    icon={loading ? <CircularProgress size={12} color= "warning"/> : undefined}
                    color="warning" /> } 
                  label="PayNow/GrabPay"/> 
                  } */}

                </RadioGroup>
              </FormControl>


            </CardContent>


            <CardContent>
              <Box display="flex">
                <Box display="flex" alignItems="center">
                <Typography>Final Price:&nbsp;&nbsp;</Typography>

                <CoinImage
                  imageWidth={21}
                />
                <Typography>{loading ? <Skeleton variant='text' width={50} /> : (data?.pr as number / 100).toFixed(2)} </Typography>
              </Box>

    
                <Elements stripe={stripePromise}>

                {
                  data?.st === undefined ? <Skeleton sx={{marginLeft: "auto"}} variant='text' width={100}/> :
                  data?.st === OrderStatusEnum.pending_refund ? <CheckoutStatus title="IN PROGRESS" color="text.secondary"/> : 
                  data?.st === OrderStatusEnum.error ? <CheckoutStatus title="ERROR" color="error"/> : 
                  data?.st === OrderStatusEnum.completed ? <CheckoutStatus title="PAID" color="success.main"/> : 
                  data?.st === OrderStatusEnum.pending ? <CheckoutButton
                    title={hasExpired ? "Expired" : "Checkout"}
                    disabled={hasExpired || loading || (data?.buid as string) === myUID || notEnough} 
                    selectPayment={selectPayment}
                    sessionId={data?.sessionId as string | undefined} 
                    openSendCreditDialog={() => setOpenSendCredit(true)}             
                  /> :  
                  data?.st === OrderStatusEnum.refund_rejected  && (data?.cuid as string) === myUID ? 
                  <CheckoutStatus fontSize={12} title="REFUND REJECTED" color="error"/> :
                  data?.st === OrderStatusEnum.refund_rejected && (data?.cuid as string) !== myUID ? 
                  <CheckoutStatus title="PAID" color="success.main"/> :
                  data?.st === OrderStatusEnum.refunded  ? <CheckoutStatus title="REFUNDED" color="text.secondary"/> : 
                  (data?.st === OrderStatusEnum.cancel || OrderStatusEnum.rejected) ? <CheckoutStatus title={
                    data?.st === OrderStatusEnum.cancel ? "CANCEL" : "REJECTED"
                  } color="error"/> : 
                  <CheckoutStatus title="EXPIRED" color="text.main"/> 
                }

                </Elements>  

              </Box>
            </CardContent>

          </Card>
        </Box>

        {openSendCredit && <SendCreditDialog
          data={data}
          open={openSendCredit}
          onCancelHandle={onCloseHandle}
        />}

   </Box>
   
}

export default StripeCheckout