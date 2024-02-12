import { FC, useState, useEffect } from 'react';


import {
    Dialog,
    DialogProps,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Typography,
    Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { auth } from '../../../store/firebase';
import FlexBox from '../../Box/FlexBox';
import CopyIcon from '../../../icons/materialUiSvg/copy';

const backEndUrl = process.env.REACT_APP_API_URL;

const ReferralDialog: FC<DialogProps> = (props) => {

    const [ t ] = useTranslation()

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [referralLink, setReferralLink] = useState<string>()
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        if (props.open) {
            getReferralLink();
            setIsCopied(false);
        }
    }, [props.open]);

    const getReferralLink = async () => {
        setIsLoading(true);
        setHasError(false)
        try {
            const url = `${backEndUrl}/v1/referrals/get`;
            const token = await auth.currentUser?.getIdToken();

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setReferralLink(response.data.data || "");
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            setHasError(true)
        }
    };

    const createReferralLink = async () => {
        setIsLoading(true);
        setHasError(false)
        try {
            const url = `${backEndUrl}/v1/referrals/new`;
            const token = await auth.currentUser?.getIdToken();

            const response = await axios.post(url, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setReferralLink(response.data.data || "");
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            setHasError(true)
        }
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(referralLink || '');
        setIsCopied(true);
    }

    const directTrackInvitesPage = () => {
        window.open("/trackinvites", "_blank")
    }

    return <Dialog fullWidth {...props}>
        <DialogTitle>
            <Box display="flex" alignItems="center">
                    <Box flexGrow={1}>Refer a friend</Box>
                    <Box>
                        <Button color='success' variant='contained' onClick={directTrackInvitesPage}>Track invites</Button>
                    </Box>
            </Box>

        </DialogTitle>
        <DialogContent>
            <Typography sx={{ mb: 3 }}>Earn 10% from your friends' withdrawals. They will earn 10% more with lesser platform fees. (First 3 months only)</Typography>
            {
                isLoading ?
                <CircularProgress size={21} color="secondary" /> :
                hasError ?
                <Typography sx={{ mb: 3 }} color="error">Something went wrong. Please try again later.</Typography> :
                referralLink ?
                <>
                    <FlexBox>
                        <input style={{ border: '2px dashed #D3D3D3', borderRight: 'none', padding: '10px' }} size={45} type="text" value={referralLink} readOnly />
                        <Button style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} variant="contained" color="secondary" onClick={handleCopy}><CopyIcon /></Button>
                    </FlexBox>
                    {isCopied && <Typography variant="caption" color="text.secondary">Link copied!</Typography>}
                </> : <Button variant="contained" color="secondary" onClick={createReferralLink}>Generate referral link</Button>
            }
        </DialogContent>
        <DialogActions>
            <Button color="warning" onClick={(e) => props.onClose?.(e, "backdropClick")}>{t("cancel")}</Button>
        </DialogActions>
    </Dialog>
}

export default ReferralDialog