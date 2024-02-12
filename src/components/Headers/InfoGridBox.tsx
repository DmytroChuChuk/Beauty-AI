import {  Skeleton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { FC, useState } from 'react';
import { mediaLinks } from '../../data/data';
import FlexBox from '../Box/FlexBox';
import CenterFlexBox from '../Box/CenterFlexBox';

interface props {
    image: string
    onClick: () => void
}

const NextButton : FC<props> = ({image, onClick}) => {

    const buttonSize = 22

    return  <CenterFlexBox
            sx={{cursor: "pointer"}}
            bgcolor = "#a8a8a880"
            borderRadius={99999999}
            height ={buttonSize}
            width={buttonSize}
            onClick={onClick}>
            <img
                src={image}
                height ={buttonSize/2}
                width={buttonSize/2}
                alt=""

            />
        </CenterFlexBox>
}

const InfoGridBox : FC<{
    width: string
    minWidth: string
    height?: string
}> = ({width, minWidth, height}) => {


    const [index, setIndex] = useState<number>(0)

    let array: any[] = []
    mediaLinks.forEach(element => {
        array.push(element)
    });

    return <Box 
        borderRadius="1rem"
        height={height}
        width={width}
        minWidth={minWidth} 
        position="relative"
    >
            {/* {
                array.map((link, index) => {
                    return <iframe
                    title={`frame-${index}`}
                    src={link}
                    width={200}
                    height={200}
                    allowFullScreen
                    style={{border: "none", overflow: "hidden", borderRadius: '1rem'}} 
                    allow="autoplay; autoclipboard-write; encrypted-media; picture-in-picture; web-share"
                />})
            } */}
            <Box 
                position="absolute"
                zIndex={1}
                width="100%"
                height="100%"
            >
                <Skeleton
                    variant='rectangular'
                    sx={{
                        borderRadius: '1rem'
                    }}
                    width="100%"
                    height="100%"
                />
            </Box>


            <iframe
                title={`frame-${index}`}
                src={mediaLinks[index]}
                width="100%"
                height="100%"
                // height={200}
                allowFullScreen
                style={{
                    border: "none", 
                    overflow: "hidden", 
                    borderRadius: '1rem', 
                    position: "absolute", 
                    zIndex: 1
                }} 
                allow="autoplay; autoclipboard-write; encrypted-media; picture-in-picture; web-share"
            />

            <CenterFlexBox
                zIndex={2}
                borderRadius={5}
                padding="0px 2px"
                position="absolute" 
                bgcolor="#00000095" 
                width="110px" height={32} right={15} bottom={10}>
                    <FlexBox  width="100%" alignItems="center" flexDirection="row" padding="0px 5px">

                        <NextButton
                            image="https://images.rentbabe.com/assets/mui/arrow_back_ios.svg"
                            onClick={() => {

                                if(index < 1){
                                    return
                                }
                                setIndex(prev => prev - 1)
                            }} 
                        />
           
                        <Typography 
                            sx={{flexGrow: 1}}
                            fontSize={14}
                            textAlign="center" 
                            fontWeight="bold" 
                            color="primary"
                            >{index + 1}/{mediaLinks.length}</Typography>

                        <NextButton
                            image="https://images.rentbabe.com/assets/mui/arrow_forward_ios.svg"
                            onClick={() => {

                                if(index >= mediaLinks.length - 1){
                                    return
                                }
                                setIndex(prev => prev + 1)
                                
                            }}  
                        />

                    </FlexBox>
            </CenterFlexBox>

    </Box>
 
}

export default InfoGridBox