import { Box } from '@mui/material';
import { FC } from 'react';
import CenterFlexBox from '../../../components/Box/CenterFlexBox';
import FlexBox from '../../../components/Box/FlexBox';

interface props {
    index: number
    width: number
    maxWidth: number
    totalUrls: string[]
    fromModal: boolean | undefined
}

const ImageIndicatorTabs : FC<props> = ({index, width, maxWidth, totalUrls, fromModal}) => {

    return <CenterFlexBox
    sx={{WebkitTransform: "translateZ(0)"}} 
    height={20} 
    width="100%" 
    position="absolute" 
    zIndex={99} 
    top={0} 
    left={0} 
    right={0} >
    <FlexBox
      width={width}
      maxWidth={maxWidth}
      paddingLeft={2}
      paddingRight={2}
      paddingTop={1}
      height={20}
      sx={{backgroundImage: "linear-gradient( rgba(0,0,0,0.2), rgba(0,0,0,0))"}} >
      {
        totalUrls.map((_, i) => {
          return <Box
            key={i} 
            marginLeft={0.2} 
            marginRight={0.2} 
            bgcolor={index === i ? "white" : "#7d7c7c"}  
            height={2.5} 
            borderRadius={1} 
          
            width = {`${fromModal ? 
              width/2.25 >= maxWidth ? maxWidth/totalUrls.length : (width/2.25)/totalUrls.length  : width / totalUrls.length}px`}
          />
        })  
      }
    </FlexBox>
    </CenterFlexBox>
 
}

export default ImageIndicatorTabs