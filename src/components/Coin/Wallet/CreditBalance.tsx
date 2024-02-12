import { Box, Button, Grid, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';
import { useWindowSize } from '../../../hooks/useWindowSize';
import { useUser } from '../../../store';
import history from '../../../utility/history';
import FlexGap from '../../Box/FlexGap';
// import WithdrawDialog from '../../Dialogs/Payout/WithdrawDialog';
import GovDialog from '../../Dialogs/Verification/GovDialog';

import CreditDetails from './components/CreditDetails';
import { version } from '../../../version/basic';
import { WiseWithdrawDialog } from '../../Dialogs/Payout/WiseWithdrawDialog';
import ReferralDialog from '../../Dialogs/Profile/ReferralDialog';

const CreditBalance : FC = () => {

    const [size] = useWindowSize()
    const max = 520

    const { t } = useTranslation()
    
    const [
        UUID, 
        verified, 
        rejectedReasonAfter,
        balance,
        pending, 
        income,
        referral,
        penaltyCredits,
        nickname,
        myReferrer,
        doesUserHasCreditDoucment
    ] = useUser((state) => [
        state?.currentUser?.uid, 
        state?.currentUser?.verified, 
        state?.currentUser?.rejectedReasonAfter,
        state?.currentUser?.balance,
        state?.currentUser?.pendingCredits,
        state?.currentUser?.incomeCredits,
        state?.currentUser?.referralCredits,
        state?.currentUser?.penaltyCredits,
        state?.currentUser?.nickname,
        state?.currentUser?.myReferrer,
        state?.currentUser?.hasCreditDocument
    ], shallow)

    const [open, setOpen] = useState<boolean>(false)
    const [openGovDialog, setGovDialog] = useState<boolean>(false)
    const [openReferralDialog, setReferralDialog] = useState(false)

    //const {loading, data} = useDocumentQuery(`${uid}-balance`, doc(db, CREDIT, uid ?? "empty"))

    const isReferredUser = () => {
        if (myReferrer?.referrer && myReferrer?.joinDate) {
            const timestamp = myReferrer?.joinDate as any;
            const joinDate = new Date(timestamp.seconds * 1000);

            const today = new Date();
            const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());

            if (joinDate > threeMonthsAgo) {
                return true;
            }
        }

        return false;
    }

    const withdraw = () => {
        if(!nickname){
            history.push(`/page/Admin?uid=${UUID}`)
        }else if(!verified){
            setGovDialog(true)
        }else{
            setOpen(true)
        }
    }

    const recharge = () => {
        history.push(`/credit?v=${version}`)
    }

    const buttons = (flexCenter: boolean) => {
        return <Box
            marginTop={flexCenter ?  2 : 0}
            display={flexCenter ? "flex" : undefined}
            width={flexCenter ? "100%" : undefined}
            justifyContent="center"
        >
    
            <Button 
                sx={{minWidth: 109}}
                variant='contained'
                color="warning"
                onClick={recharge}
            >{t("recharge")}</Button>

            <br/>
            <br/>

            {
                flexCenter && <FlexGap/>
            }

            <Button 
                sx={{minWidth: 109}}
                variant='contained'
                onClick={withdraw}
            >{t("withdraw")}</Button>
        </Box>
    }

    const handleWallet = (direction: "column" | "row") => {
        return <Box 
        display="flex" 
        flexDirection={direction} 
        alignItems="center"
    >

        {direction === "column" && <img
            width="156px"
            height="156px"
            src="https://images.rentbabe.com/assets/logo/manycoins216.png"
            alt=""
        /> }

        {buttons(false)}
    </Box>
    }

    return <div>

        <Box 
        
        display="flex"
        bgcolor="#000"
        borderRadius={2}
        padding={1}
        alignItems="center"
        >

        {size.width > max && <>
        {handleWallet("column")}
        </>

        }

        <Grid
            container
            rowSpacing={4}
            columnGap={4} 
            direction="row"
            justifyContent="center"
            alignItems="center"
        >

        <Grid item >

        <CreditDetails 
            title="Credit Balance"
            hints={t("credit.balance")}
            amount= {balance ?? 0}
        />
        </Grid>

        <Grid item >

        <CreditDetails 
            title="Credit Income"
            hints={t("credit.income")}
            amount= {income ?? 0}
        />

        </Grid>

        <Grid item  >

        <CreditDetails 
            title="Pending Credit"
            hints={t("credit.pending")}
            amount= {pending ?? 0}
        />

        </Grid>

        {(verified && doesUserHasCreditDoucment) && <Grid item>
            <CreditDetails
                title="Referral Credit"
                hints={<Typography variant='body2' whiteSpace="pre-line">
                    {t('credit.referral')}<br/><br/><b onClick={() => {
                        setReferralDialog(true)
                    }} style={{textDecoration: "underline", cursor: 'pointer'}}>Invite & Earn</b>
                </Typography>}
                amount= {referral ?? 0}
            />
        </Grid>}


        {
            size.width <= max 
            &&  <Grid   display="flex" justifyContent="center" alignItems="center" item xs={4}>
                {/* <img
                    width="156px"
                    height="156px"
                    src="https://images.rentbabe.com/assets/logo/manycoins216.png"
                /> */}

            {buttons(false)}
            </Grid>
         }
        </Grid>

        </Box>
    
         {/* {open && <WithdrawDialog
            penalty={(penaltyCredits ?? 0)/100}
            income={(income ?? 0)/100}
            open={open}
            onClose={() => setOpen(false)}
         />} */}

         {
            open && <WiseWithdrawDialog
            penalty={(penaltyCredits ?? 0)/100}
            income={(income ?? 0) / 100}
            referralCredits={(referral ?? 0) / 100}
            isReferredUser={isReferredUser()}
            onClose={() => setOpen(false)}
            open={open}
          />
         }

        <GovDialog 
            myUID={UUID}
            verified={verified}
            rejectedReasonAfter={rejectedReasonAfter}
            open={openGovDialog}
            onClose={() => setGovDialog(false)}
        />

        <ReferralDialog
            open={openReferralDialog}
            onClose = {() => setReferralDialog(false)}
            />
    
    </div>
}

export default CreditBalance