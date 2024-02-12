import { Grid, Box, Typography } from '@mui/material';
import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { rentbOrange } from '../../../keys/color';
import CenterFlexBox from '../../Box/CenterFlexBox';
import BasicTypography from '../../Typography/BasicTypography';
import { ServiceType } from '../../../keys/props/services';
import { Units } from '../../../enum/MyEnum';
import FlexBox from '../../Box/FlexBox';
import { ServicesHelper } from '../../../utility/ServicesHelper';
import CoinImage from '../../CustomImage/CoinImage';


const DisplayGrid : FC<{
    id: string
    title: string | undefined
    image: string | undefined
    selected: boolean
    serviceType?: ServiceType
    height?: number
    opacity?: number | undefined
    borderWidth?: number
    price?: number
    suffix?: Units 
    onClick: (id?: string, title?: string, serviceType?: ServiceType) => void
}> = ({
    id, 
    title, 
    image, 
    selected,
    serviceType, 
    height = 60, 
    opacity = 1, 
    borderWidth = 1, 
    price, 
    suffix, 
    onClick}) => { 

    const { t } = useTranslation()
    const servicesHelper = new ServicesHelper()

    const grid = useRef<HTMLDivElement | null>(null)
    
    const onClickhandle = () => {
        onClick(id, title ?? "", serviceType)
    }


    const titles = title?.split(" ") ?? [""]

    return <Box> 

        {(price !== undefined ) && <Box 
            sx={{opacity: selected ? 1 : 0}} 
            bgcolor="white"
            left={grid.current?.offsetLeft ?? 0}
            bottom={65}
            zIndex={999} 
            borderRadius={1} 
            marginBottom={1}>

            <FlexBox padding={1}>
                
                {((price || price)) && 
                <><CoinImage imageWidth={21}/><Typography fontWeight="bold" variant='body2'>{ price ? 
                `${(price/100).toFixed(2)}/${servicesHelper.convertUnits(suffix !== undefined ? suffix : servicesHelper.getDefaultSuffix(serviceType) )}` 
                : `${price?.toFixed(2)}/1Hr` }</Typography></> }

            </FlexBox>

        </Box>}

        <Grid ref={grid} item sx={{cursor: "pointer"}} onClick={onClickhandle}>
        
            <Box borderRadius={`${8 + borderWidth}px`} border={`${selected ? borderWidth : 0}px solid ${selected ? rentbOrange : ""}`} 
                height="100%" width="100%">

                <Box borderRadius="8px" position="relative" padding={1}  minWidth={100} maxWidth={120} height = {height}>
                <img
                    style={{
                        position: "absolute",
                        backgroundColor: "white",
                        borderRadius: "8px", 
                        objectFit: "cover",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    }}
                    width="100%"
                    height={height}
                    src={image}
                    alt=""
                />

                {title && <CenterFlexBox 
                borderRadius="8px" 
                position="absolute" 
                zIndex={2}
                bgcolor={`rgb(0,0,0,${selected ? `${0.32 * opacity}` : `${ 0.84 * opacity}` })`}  
                top={0} bottom={0} left={0} right={0}/>}

                <CenterFlexBox position="absolute" zIndex={3} top={0} bottom={0} left={0} right={0}>

                    <BasicTypography
                        sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            wordBreak: "break-all", 
                        }}
                        dangerouslySetInnerHTML={{ 
                            __html:  `${t(`${title?.toLowerCase().replaceAll(" ", "")}.service`, title)}`
                            .replaceAll(" " , `${ titles[0].length > 5 ? "<br/>" : " "}`)
                        }} 
                        maxHeight={height} 
                        textAlign="center"
                        fontWeight="bold" 
                        fontSize={17} 
                        color="primary">
                        {/* {t(`${title?.toLowerCase().replaceAll(" ", "")}.service`, title)} */}
                    </BasicTypography>
                    
                </CenterFlexBox>

                </Box>

            </Box>
        </Grid>

    </Box>

}

export default DisplayGrid