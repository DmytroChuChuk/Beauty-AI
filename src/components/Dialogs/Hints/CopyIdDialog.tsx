import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { FC } from 'react';

interface props {
    id: string,
    open: boolean
    onClose: () => void
}

// transactionId ? true : false

const CopyIdDialog : FC<props> = ({id, open, onClose}) => {

    return <Dialog fullWidth open={open} onClose={onClose}>

    <DialogTitle>Tranasaction ID</DialogTitle>

    <DialogContent>
       ID: <b>{id}</b>
    </DialogContent>

    <DialogActions>
        <Button color="warning" onClick={onClose} >Cancel</Button>
    </DialogActions>

</Dialog>
 
}

export default CopyIdDialog