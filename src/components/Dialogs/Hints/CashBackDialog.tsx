import {
    FC
} from 'react';
import {
    Dialog,
    DialogProps,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
    Box,
    Grid,
    Typography
} from '@mui/material';
import { TelegramLink } from '../../../keys/contactList';


const CashBackDialog : FC<DialogProps> = ({...props}) => {

    const images = [
        "https://images.rentbabe.com/IMAGES/CASHBACK/CONTENT_CREATOR/tiktok-thumbnail.jpeg?",
        "https://images.rentbabe.com/IMAGES/CASHBACK/CONTENT_CREATOR/tiktok-thumbnail%20(1).jpeg?",
        "https://images.rentbabe.com/IMAGES/CASHBACK/CONTENT_CREATOR/tiktok-thumbnail%20(2).jpeg?",
        "https://images.rentbabe.com/IMAGES/CASHBACK/CONTENT_CREATOR/tiktok-thumbnail%20(3).jpeg?",
        "https://images.rentbabe.com/IMAGES/CASHBACK/CONTENT_CREATOR/tiktok-thumbnail%20(4).jpeg?",
        "https://images.rentbabe.com/IMAGES/CASHBACK/CONTENT_CREATOR/tiktok-thumbnail%20(5).jpeg?"
    ]

    return <Dialog {...props}>
         <DialogTitle>RentBabe Content Creator</DialogTitle>

         <DialogContent>
            
            <DialogContentText>
                A video about RentBabe gives you guarantee views!
            </DialogContentText>

            <br/>

            <DialogContentText>
                Do a vlog about your meetup, post it on your social media and get back your 25% credits back in cash. 
            </DialogContentText>



            <br/>
            <br/>

            <Grid 
                container
                width="100%"
                spacing={{ xs: 1, md: 2 }} 
            >


            {
                images.map((url, index) => {
                    return <Grid
                    position="relative" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    onClick={() => {
                        window.open("https://www.tiktok.com/search?q=%23rentbabe&t=1683540492953", "_blank")
                    }}
                    item 
                    xs={4} 
                    sm={4} 
                    md={4} 
                    key={index}>

                        <img
                            style={{borderRadius: ".5rem", opacity: 0.64}}
                            src={url}
                            width={80}
                            alt=""
                        />

                        <Box />


                        <img
                            style={{position: "absolute", opacity: 0.80}}
                            src="https://images.rentbabe.com/assets/buttons/icons/play.svg"
                            width={24}
                            alt=""
                        />
                  
                    </Grid>
                })
            }



            </Grid>

            <DialogContentText>
                <Typography color="error" variant='caption'>
                Your social media must be active with a few thousand of followers. Please click apply to see if you are eligible. 
                </Typography>
            </DialogContentText>

         </DialogContent>


         <DialogActions>

            <Button 
                variant="text" 
                color="secondary"
                onClick={(e) => props.onClose?.(e, "backdropClick")}
            >Cancel</Button>

            <Button
                variant="text" 
                color="secondary"
                onClick={() => {
                    window.open(TelegramLink, "_blank")
                }}
            >
                Apply
            </Button>

         </DialogActions>

         {/* <Typography margin="8px 16px" variant='caption' color="error.main">Please send us the Order ID and your RentBabe username.</Typography> */}

    </Dialog>
 
}

export default CashBackDialog