import { Box } from '@mui/material';

import { FC } from 'react';
import CoinImage from '../../CustomImage/CoinImage';
import BasicTypography from '../../Typography/BasicTypography';
import { useTranslation } from 'react-i18next';

interface props  {
    itemPrice: number | undefined
    suffix: string
    color?: string
    fontSize?: number | undefined
    fontSize2?: number | undefined
    fontWeight?: string
    fontWeight2?: string
    variant?: "caption" | "body2"
    hideDecimal?: boolean
    imageSize?: number 
}

const PriceLabel : FC<props> = ({itemPrice, suffix, imageSize, color = "primary", 
fontSize = 17, fontSize2 = 8, fontWeight = "bolder", fontWeight2 = "bold", variant = "caption", hideDecimal = false}) => {

    const { t } = useTranslation();
    const fullPrice = itemPrice?.toFixed(2)
    const deci = `${fullPrice}`.split(".")
    const price = deci.length > 1 ? deci[0] : undefined
    const decimal = deci.length === 2 ? deci[1] : "00"
    
    // const suffix = serviceType === ServiceType.meetup ? "Hr" : "Min"

    return <Box display="flex" alignItems="center">
        <CoinImage imageWidth={imageSize ?? fontSize}/>
        <BasicTypography
            fontSize={fontSize}
            fontWeight={fontWeight}
            variant={variant}
            color={color}
        >{price}
    
        <BasicTypography 
            fontSize={fontSize2}
            fontWeight={fontWeight2}
            variant={variant}
            color={color} 
        >{hideDecimal ? "" : `.${decimal}`}/{t(suffix)}</BasicTypography>
        </BasicTypography>
    </Box>
 
}

export default PriceLabel