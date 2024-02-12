import { FC } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { experimentalStyled as styled } from '@mui/material/styles';
import CreditAmount from '../Wallet/components/CreditAmount';

interface props {
    index: number
    discount : number
    amount: number | undefined
    isSelected: boolean
    onClick: (index: number) => void
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "black",
    ...theme.typography.body2,
    borderRadius: 16,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));


const CreditCardView : FC<props> = ({index, discount, amount, isSelected, onClick}) => {

    const onClickHandle = () => {
        onClick(index)
    }
    
    return <Grid item xs={2} sm={4} md={4} borderRadius={8} >
            <Item  >
                <Box style={{cursor: "pointer"}} onClick={onClickHandle}>
                    <Box 
                        borderRadius={4} 
                        border={`4px solid ${isSelected ? "#FFA928" : "black"}`}  
                        position="relative"
                    >
                        <Box 
                        bgcolor="#FFA928" 
                        padding=" .1rem .5rem" 
                        position="absolute" 
                        top={4} left={8} borderRadius={1}>
                            <Typography fontWeight={700} color="primary" variant="caption">
                                +{discount * 100}% Credit 
                            </Typography>
                        </Box>

                        
                        <Box sx={{opacity: isSelected ? 1.0 : 0.54}} 
                         display="flex" flexDirection="column" alignItems="center" padding={4}  >

                            <br/>

                            <CreditAmount
                                color="primary"
                                fontSize={19} 
                                imageWidth={24}
                                amount={amount}                
                            /> 

                            <br/>
                
                            <Typography  color="primary"  >
                                ${((amount ?? 0)/100 * (1.0 - discount)).toFixed(2)}
                            </Typography>

                        </Box>

                    </Box>
                </Box>
            </Item>
    </Grid>
 
}


export {
    CreditCardView
}