import { Box, BoxProps, Typography } from '@mui/material';
import { FC } from 'react';
import { StarProps } from '../../../keys/props/profile';
import { Calculator } from '../../../utility/Calculator';
import FlexGap from '../../Box/FlexGap';

interface props extends BoxProps {
    ratings: StarProps | undefined
    fontColor?: string
    fontWeight?: string
    imageSize?: number
    
}

const RatingLabel : FC<props> = ({ratings, imageSize = 11, fontColor = "primary", fontWeight = "bolder", fontSize = 12, ...props}) => {

    const cal = new Calculator()

    return <Box 
    display="flex" 
    alignItems="center"
    {...props}>

    <img 
        width={imageSize}
        height={imageSize}
        src="https://images.rentbabe.com/assets/flaticon/star.svg"
        alt=""
    /> 

    <FlexGap gap={1}/>

    <Typography 
    fontSize={fontSize}
    fontWeight={fontWeight} 
    color={fontColor}
    variant='caption'>{ratings ? cal.weightedAverage(ratings) : "---"}</Typography>
</Box>
 
}

export default RatingLabel