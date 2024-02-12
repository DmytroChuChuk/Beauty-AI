import { FC } from 'react';
import { useUser } from '../../../store';



interface props {
    rejectedReason: string | undefined
    isApproved: boolean | undefined
    isBabePage: boolean
}

const ReviewReject : FC<props> = ({ isBabePage, rejectedReason , isApproved }) => {
    
    const [isAdmin, isPremium] = useUser((state) => [state.currentUser?.isAdmin, state.currentUser?.isPremium])

    return <div>
        {
            (isAdmin === undefined && isBabePage) && 
            <p className = "alert-text">{rejectedReason ? "Res": "S"}ubmit for review </p>
        }

        {
            ((isAdmin === false && !isPremium) || (isApproved === false && isPremium)) &&
            <p className="red-label-text" 
                >Reviewing. Come back to this page to check your status (within 24 hours).</p>
        }

        {
            (isAdmin === undefined && rejectedReason) &&  <>
                <br/>
                <p className="red-label-text" >{rejectedReason}</p>

            </> 
        }
    </div>
}

export default ReviewReject