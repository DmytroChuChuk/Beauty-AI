import { Button } from '@mui/material';
import React from 'react';
import shallow from 'zustand/shallow';
import { useWindowSize } from '../../hooks/useWindowSize';
import { useUser } from '../../store';
import { Helper } from '../../utility/Helper';
import './CoverLayer.scss'



const CoverLayer : React.FC= () => {

    const [myUID] = useUser((state) => [state.currentUser?.uid], shallow);

    const [size] = useWindowSize()

    const onClick = () => {
        const helper = new Helper()
        helper.upgradePremium(myUID)
    }


    return (<div className = "main-cover" style={{height: size.height}} >
            <img src = "https://images.rentbabe.com/assets/mui/cover.svg" alt = "" ></img>


            <label>Upgrade to Premium and access to all features</label>

            <br/>
        
            <label>RentBabe Premium benefits:</label>

            <ul>
                <li>Access to private profiles</li>
                <li>Unlimited messages</li>
                <li>10% more Credit</li>
            </ul>

            <br/>      
            <br/>

            <Button variant='contained' color = "secondary" onClick={onClick}>Upgrade to PREMIUM</Button>


        </div>)
}

export default CoverLayer;