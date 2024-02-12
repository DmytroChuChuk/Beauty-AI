import { Box, Button, ButtonProps, Typography } from '@mui/material';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import FlexGap from '../../../Box/FlexGap';

interface props {
    minValue: number
    margin?: string
    onChange?: (numberOfUnits: number) => void
}

const StepButton : FC<ButtonProps> = ({...props}) => {
    return <Button
        {...props}
        size="small"
        sx={{maxWidth: '30px', minWidth: '30px'}}
        variant='contained'
    >

    </Button>
}

const UnitStepper : FC<props> = ({minValue, margin, onChange}) => {

    const [number, setNumber] = useState<number>(minValue)

    useEffect(() => {
        onChange?.(number)
        // eslint-disable-next-line 
    }, [number])

    const increment = () => {

        if(number < 999){
            setNumber(prev => prev + 1)
        }
    }   

    const decrement = () => {
        if(number < 999 && number > minValue){
            setNumber(prev => prev - 1)
        }
    }

    const onChangeHandle = (event: ChangeEvent<HTMLInputElement> ) => {

        const value = event.currentTarget.valueAsNumber

        if(isNaN(value) || value < 1) setNumber(1)
        else if (value > 999) setNumber(999)
        else setNumber(value)
    }

    return <Box 
        display="flex"
        margin={margin} 
        width="100%"
    >

        <Box>
            <Typography>Units</Typography>
            <Typography color="error.main" variant='caption'>{minValue > 1 && `Minimum ${minValue} units`}</Typography>
        </Box>

        <Box marginLeft="auto" display="flex">

            <StepButton 
                disabled={number === 1  || number === minValue} 
                onClick={decrement}
            >
                -
            </StepButton>

            <FlexGap/>

            <input
                height = "32px"
                style={{maxWidth: "42px", textAlign: "center"}}
                onChange={onChangeHandle}
                type="number"
                readOnly
                value={number}
            />

            <FlexGap/>

            <StepButton
                disabled={number === 999} 
                onClick={increment}>
                +
            </StepButton>
        </Box>
    </Box>
 
}

export default UnitStepper