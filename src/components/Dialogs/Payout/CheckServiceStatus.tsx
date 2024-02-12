import {
    FC
} from 'react';
import {
    Dialog,
    DialogProps,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';
import CompletedService from '../../Payment/CompletedService';

interface props extends DialogProps {
    reviewId: string
    orderId: string
    myReviewLinkId: string
    amount?: number,
    when?: string | null | undefined
    onCancel: () => void
}

const CheckServiceStatus : FC<props> = ({
    reviewId, 
    orderId, 
    myReviewLinkId,
    amount,
    when,
    onCancel, 
    ...props
}) => {

    return <Dialog {...props}>
         <DialogTitle>Service Status</DialogTitle>
         <DialogContent>
            {when && <Typography variant='caption'
            >Your {amount ? ` ${(amount/100).toFixed(2)} ` : ""}Pending Credit will be transfer to Income Credit on {when} or you can get paid immediately by answering the following question below:<br/><br/></Typography>}
            <CompletedService reviewId={reviewId} orderId={orderId} myReviewLinkId={myReviewLinkId}/>
         </DialogContent>
         <DialogActions>
            <Button color='warning' onClick={onCancel}>Cancel</Button>
         </DialogActions>
    </Dialog>
 
}

export default CheckServiceStatus