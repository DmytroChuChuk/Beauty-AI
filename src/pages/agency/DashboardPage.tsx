import { Box, Typography } from '@mui/material';
import { FC, useState } from 'react';
import shallow from 'zustand/shallow';
import CenterFlexBox from '../../components/Box/CenterFlexBox';
import CopyIdDialog from '../../components/Dialogs/Hints/CopyIdDialog';
import LoadingScreen from '../../components/Loaders/LoadingScreen';
import MyAppBar from '../../components/MyAppBar';
import TransactionHistory from '../../components/Order/TransactionHistory';
import { cardGray } from '../../keys/color';
import { useClubAdmin } from '../../store';

const DashboardPage : FC = () => {

    const [clubName] = useClubAdmin((state) => [state.current?.clubName], shallow)

    const [transactionId, setTransactionId] = useState("")
    const [loading, setLoading] = useState<boolean>(true)

    const hasLoaded = () => {
        setLoading(false)
    }

    const copyIdClick = (id: string) => {
        setTransactionId(id)
    }

    const onClose = () => {
        setTransactionId("")
    }


    if(!clubName) return <LoadingScreen/>

    else return <Box
        padding=".5rem"
        className={!loading ? `chat-background` : ""}
        bgcolor={loading ? "white" : cardGray} 
        minHeight="100vh">

            <MyAppBar/>

        <CenterFlexBox>
            <Typography> 
                <b>@{clubName}</b> Income Dashboard
            </Typography> 
        </CenterFlexBox>

        <br/>

        <Box justifyContent="center" >
            <Box marginLeft="auto" marginRight="auto" maxWidth={800} >
                <TransactionHistory 
                    isPageOwner
                    hasLoaded={hasLoaded}
                    copyIdClick={copyIdClick}
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

export default DashboardPage