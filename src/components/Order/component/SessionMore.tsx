import{
    FC, 
    MouseEvent, 
    ReactNode, 
    useState
} 
from 'react';
  
  
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Avatar, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ListItemIcon, TextField } from '@mui/material';

import CenterSnackBar from '../../../chats/components/Snackbar/CenterSnackBar';
import { OrderGatewayEnum, OrderStatusEnum } from '../../../enum/OrderEnum';
import { TelegramLink } from '../../../keys/contactList';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../../store/firebase';
import { refundCreditFunction, sendPushNotificationFunction, sendTelegramNotificationFunction } from '../../../keys/functionNames';
import { APNSTokenProps, useUser } from '../../../store';
import { Helper } from '../../../utility/Helper';
import { RBAC } from '../../../enum/MyEnum';
import { APNSToken, ORDER, tele_id, USERS, status as statusKey, reject_reason_after, reject_reason } from '../../../keys/firestorekeys';
import { version } from '../../../version/basic';
import { RequestRefundProps } from '../../../keys/props/common';
import { UserInfoProps } from '../../../keys/props/common';
import { useTranslation } from 'react-i18next';

  
interface props {
    id: string,
    link: string | undefined,
    gateway: OrderGatewayEnum
    timeStamp: Timestamp
    users: string[]
    userInfo: UserInfoProps | undefined
    status: OrderStatusEnum
    requestRefundBy?: string[]
    rejectedRefundReason?: any
    requestedRefund?: RequestRefundProps
}
  
const SessionMore : FC<props> = ({
  id, 
  link, 
  gateway, 
  timeStamp, 
  users, 
  userInfo,
  status, 
  requestRefundBy, 
  rejectedRefundReason, 
  requestedRefund}) => {

    const [myUID, userRBAC ] = useUser((state) => [
      state?.currentUser?.uid,
      state?.currentUser?.userRBAC
    ])



    const helper = new Helper()
    const isAdminPage = helper.getQueryStringValue("admin") === "true" && userRBAC === RBAC.admin

    const iconImageSize = 21

    const [ t ] = useTranslation()
    const [msg, setMsg] = useState<string>()
    const [rejectReason, setRejectReason] = useState<string>()

    const [isLoading, setLoading] = useState<boolean>(false)
    const [openRejectDialog, setRejectDialog] = useState<boolean>(false)
    const [openDialog, setOpen] = useState<boolean>(false)
    const [openReasonDialog, setReasonDialog] = useState<boolean>(false)

    const [isAlertOpen, setAlert] = useState<boolean>(false)

    const [rejectedWho, setRejectedWho] = useState<string | undefined>()
  
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
  
    const [action, setAction] = useState<ReactNode | undefined>()
  
    function openAlert(msg: string, action?: ReactNode){
      setAction(action)
      setAlert(true)
      setMsg(msg)
    }
  
    const onToastClose = () => {
      setAlert(false)
    }
  
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
  
  
    const handleClose = () => {
      setAnchorEl(null);
    }

    const viewOrder = () => {
        window.open(`/page/checkout?id=${id}&v=${version}`, "_blank")
    }

    const leaveReview = () => {
        window.open(`${link}&v=${version}`, "_blank")
    }

    const onCloseHandle = () => {
      setOpen(false)
      setRejectDialog(false)
      setReasonDialog(false)
      setRejectedWho(undefined)
    }

    const issueRefund = async () => {

      setOpen(false)

      switch (gateway) {
        case OrderGatewayEnum.CREDIT:
            // issue refund function ....
            setLoading(true)
            try{
              const refundCredit = httpsCallable(functions, refundCreditFunction);
              const res = await refundCredit({
                id: id
              });
    
              const data = res.data as any;
              const status = data.status

              if(status === 200){
                openAlert("Issue refund success!")
                let promises = []
                for (let index = 0; index < users.length; index++) {
                  const _uid = users[index];
                  const member = await getDoc(doc(db, USERS, _uid))
                  const _teleid = member.get(tele_id) as string | undefined
                  const _token = member.get(APNSToken) as APNSTokenProps | undefined

                  if(_teleid){
                    const sendTelegramMessage = httpsCallable(functions, sendTelegramNotificationFunction);
                    const _link = `${window.location.origin}/wallet?=${version}`
                    const msg = `A refund was being issued. ${_link}`

                    promises.push(sendTelegramMessage({
                      tele_id: _teleid,
                      text: encodeURIComponent(msg)
                    }))
                  }

                  if(_token){
                    const sendPushNotification = httpsCallable(functions, sendPushNotificationFunction)
                    promises.push(sendPushNotification({
                        token: _token,
                        title: "Ebuddy Admin",
                        body: "A refund was being issued. Please check your wallet and order page."
                    }))
                  }
                }

                try{
                  await Promise.all(promises)
                  console.log("notified")
                }catch {
                  console.log("cannot send notification")
                }
      
              }else{
                
                console.log(status)
                console.log(data.message)

                openAlert("Unexpected error", 
                <Button href={TelegramLink}>
                  CONTACT
                </Button>)
              }
  
            }catch(error){
              console.log(error)
            }

            setLoading(false)
          

          break;

        default:
          openAlert("Unknown payment", 
          <Button href={TelegramLink}>
            CONTACT
          </Button>)
          break;
      }

    }
  
    return (
      <>    
  
          <div>
  
          <IconButton
            
              onClick={handleClick}
            >
  
              <img className="pointer" src = "https://images.rentbabe.com/assets/mui/more_vert_black_24dp.svg" alt="" />
  
          </IconButton>
  
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
            'aria-labelledby': 'basic-button'
          }}>

            <MenuItem  
                onClick={viewOrder}>

                <ListItemIcon>
                    <img
                    height={iconImageSize}
                    width={iconImageSize}    
                    
                    src= "https://images.rentbabe.com/assets/mui/open_in_new.svg"
              
                    alt=""
                    />
                </ListItemIcon>

                {t("view.order")}
            </MenuItem>

            <MenuItem  
                onClick={leaveReview}>

                <ListItemIcon>
                    <img
                    height={iconImageSize}
                    width={iconImageSize}
                    src= "https://images.rentbabe.com/assets/mui/emoji_emotions.svg"
                    alt=""
                    />
                </ListItemIcon>

                {t("give.review")}
            </MenuItem>

            {(requestRefundBy?.includes(myUID ?? "") && rejectedRefundReason) &&
              <MenuItem 
              disabled={isLoading}
              onClick={() => setReasonDialog(true)}>

              <ListItemIcon>
                  <img
                    height={iconImageSize}
                    width={iconImageSize}
                    src="https://images.rentbabe.com/assets/question.svg"
                    alt=""
                  />
              </ListItemIcon>
                Refund rejected
              </MenuItem> 
            }

            {isAdminPage && <MenuItem 
                disabled={isLoading}
                sx={{color: timeStamp.toDate().getNumberOfHoursAgo() > 72 ? "red" : "black"}}
                onClick={() => setOpen(true)}>

                <ListItemIcon>
                    {isLoading ? <CircularProgress size={iconImageSize} color="warning"/> : <img
                    height={iconImageSize}
                    width={iconImageSize}
                    src="https://images.rentbabe.com/assets/mui/logout.svg"
                    alt=""
                    />}
                </ListItemIcon>

                Issue refund {timeStamp.toDate().getNumberOfHoursAgo() > 72 ? "(more than 72 hours)" : ""}

            </MenuItem> }


            {
              (requestedRefund && isAdminPage) && <>
              {Object.entries(requestedRefund).map((value) => {

                const userUUID = value[0]

                return <MenuItem 
                disabled={isLoading}
                onClick={() => {
                  setRejectedWho(userUUID)
                  setRejectDialog(true)
                }}>

                <ListItemIcon>
                    {isLoading ? <CircularProgress size={iconImageSize} color="warning"/> : <Avatar
                      sx={{ width: 56, height: 56}}
                      variant="rounded"
                      src={userInfo?.[userUUID]?.u}
                    />}
                </ListItemIcon>
                  Reject {userInfo?.[userUUID]?.nick}
                </MenuItem>
              })}
              </>
            }

            {
              (status === OrderStatusEnum.completed || 
              status === OrderStatusEnum.pending_refund || 
              status === OrderStatusEnum.refund_rejected) && <MenuItem 
                disabled={isLoading} 
                onClick={() => {window.open(`/refund?id=${id}&v=${version}` ,"_blank")}}
              >
              <ListItemIcon>
                  {isLoading ? <CircularProgress size={iconImageSize} color="warning"/> : <img
                  height={iconImageSize}
                  width={iconImageSize}
                  src="https://images.rentbabe.com/assets/mui/logout.svg"
                  alt=""
                  />}
              </ListItemIcon>
                {t("request.refund")}
              </MenuItem>
            }
  
          </Menu>
  
          </div>

  
        <CenterSnackBar
          open = {isAlertOpen} 
          message={msg} 
          autoHideDuration={2000} 
          onClose={onToastClose}
          action = {action}
        />

        <Dialog
          fullWidth
          open={openDialog}
          onClose={onCloseHandle}
        >
          <DialogTitle>Refund Credit</DialogTitle>
          <DialogContent>
            You cannot get back refunded credits. Are you sure? 
            {timeStamp.toDate().getNumberOfHoursAgo() > 72 && "This order is already more than 72 hours, please check evidence before you issue refund"}
          </DialogContent>
          <DialogActions>
              <Button color="warning" onClick={onCloseHandle}>Cancel</Button>
              <Button 
              color="warning" onClick={issueRefund}>Refund</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          fullWidth
          open={openReasonDialog}
          onClose={onCloseHandle}
        >
          <DialogTitle>You refund request is rejected</DialogTitle>
          <DialogContent>
            {rejectedRefundReason?.[myUID ?? ""]?.rrn
            ?? rejectedRefundReason?.[users.find(v => v !== myUID) ?? ""]?.rrn 
            ?? rejectedRefundReason}
          </DialogContent>
          <DialogActions>
              <Button color="warning" onClick={onCloseHandle}>Ok</Button>
          </DialogActions>
        </Dialog>

        

        <Dialog
          fullWidth
          open={openRejectDialog}
          onClose={onCloseHandle}
        >
          <DialogTitle>Reject {userInfo?.[rejectedWho ?? ""]?.nick} Refund</DialogTitle>

          <DialogContent>

           <TextField
              fullWidth
              multiline
              rows={3}
              color="warning"
              placeholder='Give a reason'
              onChange={(e) => {
                setRejectReason(e.currentTarget.value)
              }}
           />

          </DialogContent>

          <DialogActions>
              <Button color="warning" onClick={onCloseHandle}>Cancel</Button>
              <Button 
              color="warning" onClick={ async () => {

                if(!rejectReason || !userInfo || !rejectedWho) return
                setLoading(true)
        
                const update = updateDoc(doc(db, ORDER, id), {
                  [statusKey]: OrderStatusEnum.refund_rejected.valueOf(),
                  [`${reject_reason_after}.${rejectedWho}.${reject_reason}`]: `Refund request is being rejected.\n\nReason: ${rejectReason}`
                })


                let promises: Promise<any>[] = [update]
                const _uid = rejectedWho
                const member = await getDoc(doc(db, USERS, _uid))
                const _teleid = member.get(tele_id) as string | undefined
                const _token = member.get(APNSToken) as APNSTokenProps | undefined

                if(_teleid){
                  const sendTelegramMessage = httpsCallable(functions, sendTelegramNotificationFunction);
                  const _link = `${window.location.origin}/wallet?=${version}`
                  const msg = `Your request for a refund is being rejected. ${_link}`

                  promises.push(sendTelegramMessage({
                    tele_id: _teleid,
                    text: encodeURIComponent(msg)
                  }))
                }

                if(_token){
                  const sendPushNotification = httpsCallable(functions, sendPushNotificationFunction)
                  promises.push(sendPushNotification({
                      token: _token,
                      title: "Ebuddy Admin",
                      body: "A refund request is being rejected. Please check your wallet and order page."
                  }))
                }
                

                await Promise.all(promises)
                
                setLoading(false)

              }}>Reject</Button>
          </DialogActions>
        </Dialog>
      </>
  
    );
}

// 
export default SessionMore;