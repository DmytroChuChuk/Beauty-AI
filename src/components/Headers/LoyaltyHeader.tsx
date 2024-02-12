import { Typography } from '@mui/material';
import { FC } from 'react';
import { Calculator } from '../../utility/Calculator';
import CenterFlexBox from '../Box/CenterFlexBox';
import { loyalPointsLimit } from '../../data/data';

const LoyaltyHeader : FC = () => {

    const cal = new Calculator()

    return <CenterFlexBox padding="0px 16px" bgcolor="black">
        <Typography 
            textAlign="center" 
            fontWeight="bold" 
            color='primary' 
            variant='caption'
            >Congratz! You have more than {cal.priceFormat(((loyalPointsLimit ?? 0) / 100))} Loyalty Points. You are able to filter and view private profiles at a certain time period.</Typography>
  </CenterFlexBox>
 
}

export default LoyaltyHeader