import { Accordion, Typography, AccordionDetails, AccordionProps } from '@mui/material';
import { FC } from 'react';
import CoinImage from '../../CustomImage/CoinImage';
import AccordionIcon from '../components/AccordionIcon';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';

interface props extends AccordionProps {
    priceState: number
    onInputChange: (value: number) => void
}

const PricePanel : FC<props> = ({priceState, onInputChange, ...props}) => {


    return <Accordion  {...props}>
    <AdminAccordionSummary>

        <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_price.svg"/>
      
        <Typography marginLeft={3}>Require price</Typography>

        {priceState ? <img alt="" src = "https://images.rentbabe.com/assets/mui/green_tick.svg" className="green_tick"/> : null}

    </AdminAccordionSummary>
        
    <AccordionDetails>
    <div className = "price-div">

        <CoinImage 
            margin='0 8px auto 0'
        />
        
        <input 
            pattern="[0-9]*" 
            required 
            type='number' 
            name="field2"    
   
            placeholder='Price'
            value={priceState} 
            onChange={(e) => {
                
                const p = (e.target as HTMLInputElement).valueAsNumber
                const rounded = Math.round(p * 100) / 100
                onInputChange(rounded)

            }}

        />

        <div>
            <label  className = "move-left">/1Hour</label>
        </div>

        </div>
    </AccordionDetails>
    
</Accordion>

}

export default PricePanel

// onChange={(e) => {
    
//     const p = (e.target as HTMLInputElement).valueAsNumber

//     setPriceState(p)

// }}