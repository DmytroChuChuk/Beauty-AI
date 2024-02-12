import { Box } from '@mui/material';
import { FC, useState } from 'react';
import Wallet from '../../components/Coin/Wallet/Wallet';
import CopyIdDialog from '../../components/Dialogs/Hints/CopyIdDialog';
import MyAppBar from '../../components/MyAppBar';
import TelegramAlert from '../../components/Notifications/TelegramAlert';
import TransactionHistory from '../../components/Order/TransactionHistory';
import { cardGray } from '../../keys/color';
import { useUser } from '../../store';
import LoginPage from '../LoginPage';


const WalletPage : FC = () => {

    const [transactionId, setTransactionId] = useState("")
    const [loading, setLoading] = useState<boolean>(true)
    const [uid, isBlock] = useUser((state) => [state?.currentUser?.uid, state.currentUser?.isBlock])

    const onClose = () => {
        setTransactionId("")
    }


    if (isBlock) return <>
    </>

    if(!uid) return <LoginPage/>

    return <Box
    padding=".5rem"
    className={!loading ? `chat-background` : ""}
    bgcolor={loading ? "white" : cardGray} 
    minHeight="100vh"
    >
    <MyAppBar/>

    <TelegramAlert fullWidth/>

        <Box 
            display="flex" 
            justifyContent="center" 
            marginBottom="10px"
        >
            <Wallet/>
        </Box>


        <Box justifyContent="center" >
            <Box marginLeft="auto" marginRight="auto" maxWidth={800} >
                <TransactionHistory 
                    hasLoaded={() => {
                        setLoading(false)
                    }}
                    copyIdClick={(id) => {
                        setTransactionId(id)
                    }}
                />
            </Box>
        </Box>

        <CopyIdDialog
            id={transactionId}
            open={transactionId ? true : false}
            onClose={onClose}
        />


    </Box>
}

export default WalletPage