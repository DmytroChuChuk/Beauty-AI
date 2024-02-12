import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CenterFlexBox from '../../components/Box/CenterFlexBox';
import RefundHint from '../../components/Typography/RefundHint';



const AccessButton: FC<ButtonProps> = ({...props}) => {
    return <Button {...props} fullWidth color="warning" 
      sx={{borderRadius: 99999, fontWeight: "bolder" , textTransform: "none", fontSize: "17px"}}
    />
}


interface props {
    maxWidth: number
    loadingChat: boolean
    sendRequestOrder: () => Promise<void>
}

const RequestOrderBottomBar : FC<props> = ({maxWidth, loadingChat, sendRequestOrder}) => {

    const [ t ] = useTranslation()


    return <CenterFlexBox 
    height={70}
    bottom={0} 
    left={0} 
    right={0}
    zIndex={10}
    position="fixed">
        <CenterFlexBox 
        width="100%"
        bgcolor="white" 
        padding="4px 16px 16px 16px"
        flexDirection="column"
        maxWidth={maxWidth}
        >

    <AccessButton
      variant='contained'
      onClick={sendRequestOrder}

      endIcon={
        loadingChat && <CircularProgress color="primary" size={12}/>
      }
    >
      {t("request.button")}
    </AccessButton>

    <RefundHint/>


    </CenterFlexBox> 
  </CenterFlexBox>
 
}

export default RequestOrderBottomBar