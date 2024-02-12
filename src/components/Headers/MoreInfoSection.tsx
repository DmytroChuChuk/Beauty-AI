import { FC } from 'react';
import { Box } from '@mui/system';
import { Grid, GridProps } from '@mui/material';
import history from '../../utility/history';
import { UserType } from '../../pages/DisplayUserProfilePage';
import { logEvent } from '@firebase/analytics';
import { analytics } from '../../store/firebase';
import { AnalyticsNames } from '../../keys/analyticNames';
import { useTranslation } from 'react-i18next';

interface props extends GridProps {
    image: string
    onClick?: () => void
}

const MoreInfoGrid : FC<props> = ({image, onClick, xs = 6}) => {
    return <Grid
        item
        xs={xs}
        sx={{cursor: "pointer"}} 
        borderRadius="8px" 
        onClick={onClick}
    >

        <Box sx={{width: "100%", height: "100%"}}>
        
            <img
                src={image}
                style={{
                    borderRadius: "8px", 
                    position: "relative", 
                    // zIndex: 2, 
                    objectFit:"cover",
                    objectPosition: "center",
        
                }}
                draggable={false}
                width="100%"
                height="100%"
                alt=""
            />

        </Box>
{/* 
        <Skeleton
            sx={{borderRadius: "4px" , position: "absolute", zIndex: 1}} 
            variant='rectangular'
            width="100%"
            height="100%"
        /> */}

        {/* <img
            src={image}
            style={{
                borderRadius: "4px", 
                // position: "relative", 
                // zIndex: 2, 
                objectFit:"cover",
                objectPosition: "center",
      
            }}
            draggable={false}
            width="100%"
            height="100%"  
            alt=""
        /> */}

    </Grid>
}


const MoreInfoSection : FC<{
    isMobile: boolean
}> = ({isMobile}) => {

    const { i18n } = useTranslation();

    if(isMobile) return <Grid container spacing={1}>

        <MoreInfoGrid
            xs={12}
            onClick={() => {
                try{
                    logEvent(analytics, AnalyticsNames.banners, {
                        banners: `banner ${UserType.NEW_USER}`
                    })  
                }catch{}

                history.push(`/page/renting?usertype=${UserType.NEW_USER}`)
            }}
            image={`../assets/banner/${i18n.language === "zh" ? 'zh' : 'en'}/newuser.jpg`}
        />


        <MoreInfoGrid
            xs={12}
            onClick={() => {
                try{
                    logEvent(analytics, AnalyticsNames.banners, {
                        banners: `banner ${UserType.MOST_POTENTIAL}`
                    })  
                }catch{}
                history.push(`/page/renting?usertype=${UserType.MOST_POTENTIAL}`)
            }}
            image={`../assets/banner/${i18n.language === "zh" ? 'zh' : 'en'}/best.jpg`} 
        />



    </Grid>

    else return <Grid container spacing={1} >

        <MoreInfoGrid
            onClick={() => {
                try{
                    logEvent(analytics, AnalyticsNames.banners, {
                        banners: `banner ${UserType.MOST_POTENTIAL}`
                    })  
                }catch{}
                history.push(`/page/renting?usertype=${UserType.MOST_POTENTIAL}`)
            }}
            image={`../assets/banner/${i18n.language === "zh" ? 'zh' : 'en'}/best.jpg`} 
        />

        <MoreInfoGrid
            onClick={() => {
                try{
                    logEvent(analytics, AnalyticsNames.banners, {
                        banners: `banner ${UserType.NEW_USER}`
                    })  
                }catch{}
                history.push(`/page/renting?usertype=${UserType.NEW_USER}`)
            }}
            image={`../assets/banner/${i18n.language === "zh" ? 'zh' : 'en'}/newuser.jpg`} 
        />


         <MoreInfoGrid
            onClick={() => {
                try{
                    logEvent(analytics, AnalyticsNames.banners, {
                        banners: `banner discord`
                    })  
                }catch{}
                window.open("https://discord.gg/rcm3byxSwR", "_blank")
            }}  
            image={`../assets/banner/${i18n.language === "zh" ? 'zh' : 'en'}/discord.jpg`} 
        />

  
        <MoreInfoGrid 
            onClick={() => {
                try{
                    logEvent(analytics, AnalyticsNames.banners, {
                        banners: `banner telegram`
                    })  
                }catch{}
                window.open("https://t.me/RentBabeCommunity", "_blank")
            }}
            image={`../assets/banner/${i18n.language === "zh" ? 'zh' : 'en'}/telegram.jpg`} 
        />




    </Grid>
 
}

export default MoreInfoSection