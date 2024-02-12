import { Box } from '@mui/material';
import { FC, ReactNode } from 'react';
import { chatGray } from '../../../keys/color';

interface props {
    mobileView: boolean
    numberOfServices: number
    maxWidth: number
    children: ReactNode
}

const ProfilePageContainer : FC<props> = ({mobileView, numberOfServices, maxWidth, children}) => {

    return <Box
    position="relative" 
    borderRadius={`0px 0px ${mobileView ? "0px 0px" : "16px 16px"}`} 
    border={mobileView ? undefined : `1px solid ${chatGray}`} 
    bgcolor="white" 
    margin="0px auto" 
    height={numberOfServices === 0 ? "99%" : "auto"}
    maxWidth={maxWidth} 
    marginBottom={mobileView ? 10 : 20}>
        {children}
    </Box>
 
}

export default ProfilePageContainer