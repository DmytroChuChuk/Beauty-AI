import { Typography } from '@mui/material';
import { FC } from 'react';
import CenterFlexBox from '../../Box/CenterFlexBox';

interface props {
    title: string
}

const EmptyHistory : FC<props> = ({title}) => {

    return <CenterFlexBox 
    display="flex" 
    flexDirection="column"
    justifyContent="center"
    >

    <br/>
    <img
        width={150}
        height={150}
        src="https://images.rentbabe.com/assets/webp/blank.webp"
        alt=""
    />
    <br/>

    <Typography 
        variant='caption' 
        color="text.secondary">
            {title}
    </Typography>

    </CenterFlexBox>
 
}

export default EmptyHistory