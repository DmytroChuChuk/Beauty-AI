import { FC} from 'react';
import { CircularProgress } from '@mui/material';

interface props {
    connectISG: boolean
    isg: string | undefined
    isgUsername: string | undefined
    onClick: () => void
}

const Instagram : FC<props> = ({connectISG, isg, isgUsername, onClick}) => {

    return <div>
   
        <div  className="insta-container">
            <div className="insta-item">
                <img alt=""  src= "https://images.rentbabe.com/assets/igfill.svg" ></img>
            </div>

            <div className='flex-gap'/>
            
            <div className="insta-item" >
                {!connectISG && <p>{!isg ? "Connect Instagram": isgUsername}</p>}
            </div>

            <div className="insta-item-end" onClick={onClick}>
                {
                    connectISG ? <CircularProgress size = {12} color="secondary" /> : 
                    <small style={{ color: (!isg ? "#3572ff":"#f24430")}}>{!isg ? "CONNECT":"DISCONNECT"}</small>
                }
            </div>

        </div>
        <label className="insta-btm-label">{isg ? "" : "*Your Instagram username will NOT be shown" }</label>
    </div>
 
}

export default (Instagram);