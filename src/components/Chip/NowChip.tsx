import { Typography } from '@mui/material';
import { BoxProps } from '@mui/system';
import { FC } from 'react';
import CenterFlexBox from '../Box/CenterFlexBox';

interface props extends BoxProps{

}

const NowChip : FC<props> = ({...props}) => {

    return <CenterFlexBox 
    padding="0px 6px" 
    borderRadius={99999} 
    border="1px solid white"
    bgcolor="success.main" 
    {...props}
    >
        <img width={12} height={12} src="https://images.rentbabe.com/assets/flaticon/lightning.svg" alt=""/> 
        <Typography marginLeft="2px" color="primary" variant='caption'>Available today</Typography>
    </CenterFlexBox>
 
}

export default NowChip