import { Box, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import { FC } from 'react';
import { EmeetsProps } from '../../keys/props/common';
import CenterFlexBox from '../Box/CenterFlexBox';
import FlexGap from '../Box/FlexGap';

interface props {
    emeetState: EmeetsProps | undefined
}

const EmeetsPrefStack: FC<props> = ({emeetState}) => {

    const pref = ["text", "audio", "video"]

    if(!emeetState) return null
    else return <Box>

        {
            pref.map((name, index) => {
                const isAvailable = emeetState?.pref?.includes(name) ?? false
                let _name = name
                if(name === "text"){
                  _name = "Texting"
                }else if (name === "audio"){
                  _name = "Audio"
                }else if (name === "video"){
                  _name = "Video"
                }

                return <EmeetsPrefCard
                    key={index} 
                    index={index}
                    name={_name}
                    isAvailable={isAvailable}
                />
            })
        }
    </Box>
}

const EmeetsPrefCard : FC<{
    index: number
    name: string
    isAvailable: boolean
}> = ({index, name, isAvailable}) => {

    return <Card
                key={index}  
                elevation={3}
                sx={{
                    marginBottom: .5,
                    width: "100%", 
                    minWidth: 80, 
                    maxWidth: 120, 
                    background: "white", 
                    borderRadius: 1}}>

                <CenterFlexBox padding="4px 0px">
                <Typography fontWeight="bold" variant='body2'>{name}</Typography>
                <FlexGap gap={2}/>
                <img
                    width={16}
                    height={16}
                    src = {`https://images.rentbabe.com/assets/mui/${isAvailable ? "green_tick" : "cancel"}.svg?v=3`} 
                    alt=""
                />
            </CenterFlexBox>
        </Card>
}

export default EmeetsPrefStack