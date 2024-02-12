import{
  FC, 
  MouseEvent, 
  useState
} 
from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { CircularProgress, IconButton, Typography } from '@mui/material';
import ReportDialog from '../../../components/Dialogs/Rent/ReportDialog';
import GovDialog from '../../../components/Dialogs/Verification/GovDialog';
import shallow from 'zustand/shallow';
import { useUser } from '../../../store';
import { LockEnum, lockChat } from '../../../utility/CloudFunctionTrigger';
import { useTranslation } from 'react-i18next';

interface props {
    senderUUID: string | undefined
    myBlock: boolean
    chatRoomID: string | undefined
    hasOrder: boolean
    reportData? : {
      user: string | undefined
      reportBy: string | null | undefined
  },
    reportClick?: () => void
    deleteClick?: () => void
    blockClick?: () => void
    openProfile?: () => void
  

}

const HeaderMore : FC<props> = ({
  senderUUID,
  myBlock, 
  chatRoomID, 
  hasOrder,
  reportData, 
  reportClick, 
  deleteClick, 
  blockClick, 
  openProfile}) => {

  const [ t ] = useTranslation()

  const [isAdmin, uid, verified, rejectedReasonAfter] = useUser((state) => [
    state.currentUser?.isAdmin,
    state.currentUser?.uid,
    state.currentUser?.verified,
    state.currentUser?.rejectedReasonAfter
  ], shallow)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [openReport, setReport] = useState<boolean>(false)
  const [isOpen, setOpen] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onLockChat = async () => {

    // https cloud function trigger
    if(!chatRoomID) return

    setLoading(true)
    try{
      await lockChat(chatRoomID, LockEnum.LOCKED)
    }catch(error){
      console.log(error)
    }
    setLoading(false)
  }


  const onHandleReport = () => {

    reportClick?.()

    setReport(true)

    handleClose()
   
  }

  const onHandleBlock = () => {

    blockClick?.()
    handleClose()
    
  }

  const onDeleteConvo = () => {

    // setDelete(true)
    deleteClick?.()
    handleClose()
  }

  const onCloseDalog = () => {
    setOpen(false)
  }

  const onOpenProfile = async () => {
 
    openProfile?.()

    handleClose()
  }

  const onReportDialogClose = () => {
    setReport(false)
  }

  const handleClose = () => {
    if(isLoading){
      return
    }

    setAnchorEl(null)
  }

  const MyMenuItem: FC<{isLoading?: boolean, name: string, onClick : () => void, color?: string}> = 
  ({isLoading, name, onClick, color = 'inherit'} ) => {
    return  <MenuItem  sx={{justifyContent: 'right', minWidth: 80}} onClick={onClick}>

      <Typography color={color}>
        {isLoading && <CircularProgress style={{marginRight: "8px"}} size={12} color="secondary"/>}
        {name}
      </Typography>
   
      </MenuItem>
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
            
          <MyMenuItem
            name={t("label.services")} onClick={onOpenProfile}/>

          {(isAdmin && senderUUID !== uid) &&
              <MyMenuItem isLoading = {isLoading} name={`${hasOrder ? "Lock" : "Unlock"} chat`} onClick={onLockChat}/>
          }

          <MyMenuItem name={t("delete")} onClick={onDeleteConvo}/>

        
          <MyMenuItem name={t("report.button")} onClick={onHandleReport} color='error'/>
          <MyMenuItem name={myBlock ? t("unblock") : t("block")} onClick={onHandleBlock} color='error'/>

        </Menu>

        </div>

        <ReportDialog
          chatRoomId={chatRoomID}
          open={openReport}
          onClose={onReportDialogClose}
          reportBy={reportData?.reportBy}
          user={reportData?.user}
        />

      <GovDialog
        open={isOpen}
        onClose={onCloseDalog} 
        myUID={uid} 
        verified={verified} 
        rejectedReasonAfter={rejectedReasonAfter}
      />
    </>

  );
}

export default HeaderMore;