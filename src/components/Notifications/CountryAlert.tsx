import { Snackbar, Typography } from '@mui/material';
import { FC } from 'react';
import { version } from '../../version/basic';
import { logEvent } from 'firebase/analytics';
import { AnalyticsNames } from '../../keys/analyticNames';
import { analytics } from '../../store/firebase';

const CountryAlert : FC<{
    open: boolean,
    handleClose: () => void
}> = ({open, handleClose}) => {


    return <Snackbar
    anchorOrigin={{vertical: "bottom", horizontal: "left"}}
    open={open}
    action={
        <img
            width={12}
            src = "https://images.rentbabe.com/assets/close.svg"
            onClick={handleClose}
            alt=""
        />
    }
    onClose={handleClose}
    message={
        <a onClick={() => {
            try{
                logEvent(analytics, AnalyticsNames.buttons, {
                    content_type: "kl alert",
                    item_id: "kl alert", 
                })  
            }catch{}
        }} href={`/page/rent?v=${version}&state=kl`}>
            <Typography  fontSize="inherit" color="primary" fontWeight="bold">
                Click here to view Kuala Lumpur profiles
            </Typography>
        </a>
    }/>

    // return <CenterFlexBox
    // width="100%"
    // height="56px"
    // bgcolor={rentbOrange}
    // sx={{position: "fixed", top: "76px", zIndex: 999999}}>

    //     <Typography color="primary" fontWeight="bold">
    //         Check out <a href="/?state=kl" >Kuala Lumpur</a> profiles
    //     </Typography>

    //     <FlexGap gap={8}/>

    //     <img
    //         width={12}
    //         src = "https://images.rentbabe.com/assets/close.svg"
    //         alt=""
    //     />
          
    // </CenterFlexBox> 
 
}

export default CountryAlert