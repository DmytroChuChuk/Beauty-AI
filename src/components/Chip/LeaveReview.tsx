import { 
    FC
} from 'react';

import { Chip, ChipProps } from '@mui/material';

interface props extends ChipProps{
    link: string | undefined
    myReviewLinkId: string | undefined
}

const LeaveReview : FC<props> = ({link, myReviewLinkId, ...props}) => {

    return <Chip
    {...props} 
    onClick={() => {
        window.open(`${link}&myReviewLinkId=${myReviewLinkId}`, "_blank")
    }}
    sx={{cursor: "pointer"}}
    icon={
        <img
            width={24}
            height={24}
            src= "https://images.rentbabe.com/assets/mui/emoji_emotions.svg"
            alt=""
        />
    } 
    label={`Review`}
/>
 
}

export default LeaveReview