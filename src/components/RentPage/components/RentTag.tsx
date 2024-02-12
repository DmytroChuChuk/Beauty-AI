import { Box, BoxProps, Typography } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CenterFlexBox from '../../Box/CenterFlexBox';

import "./scss/RentTag.scss"

interface props extends BoxProps {
    size?: "small" | "normal"
    title: string | undefined
    removeAngle?: boolean
    // numberOfServices?: number
}

const RentTag : FC<props> = ({ size = "normal", removeAngle = false, title}) => {

    // {title.shorten(10)}

    const {t} = useTranslation()

    if(!title) return null
    else return <CenterFlexBox
    // maxWidth="80px!important"
    className= {`tag default ${size}`}

    >

        <Typography
            color="primary"
            fontSize={size === "small" ? 10 : 14}
            fontWeight="bold"
            // sx={{
            //     display: '-webkit-box',
            //     overflow: 'hidden',
            //     WebkitBoxOrient: 'vertical',
            //     WebkitLineClamp: 1,
            //     userSelect: "none"
            // }}
            >
            {t(`${title?.toLowerCase().replaceAll(" ", "")}.service`, title.shorten(18) )}
        </Typography>

        {/* <BasicTypography fontSize={size === "small" ? 10 : 14} fontWeight="bolder" color="primary">{title.shorten(10)}</BasicTypography> */}

        {!removeAngle && <Box className={`tri-arrow-${size}`} />}
    </CenterFlexBox>
    
    // if(serviceType === ServiceType.eMeet) return <CenterFlexBox
    // className= {`tag ${direction} ${size} non-gamer`}>
    //     <BasicTypography fontSize={size === "small" ? 10 : 11} fontWeight="bolder" color="primary">{numberOfServices > 1 ? "+" : ""}E-Meet</BasicTypography>
    //     <Box
    //         className="tri-arrow"
    //     />
    // </CenterFlexBox>

    // else if(serviceType === ServiceType.games) return <CenterFlexBox
    // className= {`tag ${direction} ${size} gamer`}>
    //     <BasicTypography  fontSize={size === "small" ? 10 : 11} fontWeight="bolder" color="primary">{numberOfServices > 1 ? "+" : ""}Games</BasicTypography>
    //     <Box
    //         className="tri-arrow-gamer"
    //     />
    // </CenterFlexBox>

    // else return null
 
}


export default RentTag