import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle, IconButton, Typography } from '@mui/material';
import { FC } from 'react';
import { useUser } from '../../../store';
import CoinImage from '../../CustomImage/CoinImage';
import LimitWarning from '../../Services/component/LimitWarning';
import { PriceLimitProps } from '../../Services/PriceLimit';
import MobileTooltip from '../../Tooltip/MobileTooltip';



interface props extends DialogProps {
    isPriceLimit?: boolean
    priceLimit?: PriceLimitProps
    price: number | undefined
    clientNickname?: string | null | undefined
    nickname: string | undefined
    onClose: () => void
}

const InsufficientFundDialog : FC<props> = ({nickname, price, priceLimit, clientNickname, 
    isPriceLimit = false, onClose, ...props}) => {

    const [_uid] = useUser((state) => [state?.currentUser?.uid])

    return <Dialog
        {...props}
        onClose={onClose}
    >
        <DialogTitle sx={{display: "flex", alignItems: "center"}}>

            {price ? <><CoinImage/>Insufficient Credits
                
                </>
                : <>Message</>
            }

            {price && <IconButton

                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >

                <img
                    src = "https://images.rentbabe.com/assets/mui/close_rounded.svg"
                    alt=""
                />
           
            </IconButton>}

        </DialogTitle>
            
        <DialogContent>

            {isPriceLimit ? <LimitWarning
                client={clientNickname}
                nickname={nickname}
                walletLimit={priceLimit?.wlmt}
                operatorState={priceLimit?.opkey}
                spendLimit={priceLimit?.slmt}
            
            />
            
            : price ? <DialogContentText>
                You need at least {price} Credit in your wallet to message most profiles <MobileTooltip 
                duration={15000}
                title={
                    <>
                        <Typography variant='caption'>If a profile lowest price of service is 20 Credit, you will need at least 20 Credit in you wallet to chat. You may then use the Credit to purchase any services.</Typography>
                        <br/>
                        <br/>
                        <Typography variant='caption'>Typically, a user with 100 Credit in their wallet are able to message all the public profiles.</Typography>
                        <br/>
                        <br/>
                        <Typography variant='caption'>You may also upgrade to Premium to get 10% OFF for all credit purchase, access to private profiles and get unlimited messages.</Typography>
                    </>
                }>
                <img
                width={16}
                height={16}
                    src="https://images.rentbabe.com/assets/question.svg"
                    alt=""
                />
            </MobileTooltip>. You may then use the Credit to purchase any services. Otherwise, you can upgrade as a premium.
            </DialogContentText> : 
            <DialogContentText>
                Seems like {nickname?.capitalize()} did not specific a price. Please upgrade to premium to message her.
            </DialogContentText> 
            }


        </DialogContent>

        <DialogActions>
            {!price && <Button color="warning" onClick={onClose}>Cancel</Button>}
            {!isPriceLimit && <Button href={`/Subscribe?uid${_uid}`} color="warning" >Upgrade</Button>}
            {price && <Button href="/credit" color="error">Buy credits</Button>}

        </DialogActions>

    </Dialog>
 
}

export default InsufficientFundDialog