import { FC } from 'react';
import { Box, BoxProps, Paper } from '@mui/material';

import { experimentalStyled as styled } from '@mui/material/styles';

interface props {
    index: number
    isSelected: boolean
    onClick: (index: number) => void
    boxProps?: BoxProps
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "black",
    ...theme.typography.body2,
    borderRadius: 16,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

const CardSelector : FC<props> = ({index, isSelected, onClick, boxProps}) => {

    const onClickHandle = () => {
        onClick(index)
    }

    return  <Item  sx={{opacity: isSelected ? 1.0 : 0.54}} >
        <div style={{cursor: "pointer"}} onClick={onClickHandle}>
            <Box 
                {...boxProps}
                border={`4px solid ${isSelected ? "#FFA928" : "black"}`}  
               
            >
 
            </Box>
        </div>
    </Item>
 
}

export default CardSelector