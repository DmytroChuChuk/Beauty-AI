import React from 'react';

import { auth } from "../../store/firebase";
import { useUser } from '../../store';
import { block, gender, nickname, rbac, sortByRatings, stripeConnectAccount, tele_id, video_verification } from '../../keys/firestorekeys';

import { Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle, 
    Button
} from '@mui/material';

import { timer, 
    myUid, 
    url, 
    admin, 
    filterDrinks, 
    filterGender, 
    filterPrice, 
    filterProfile, 
    filterRace,
    inactive,
    adminPageTab
} from '../../keys/localStorageKeys';
import { useTranslation } from 'react-i18next';


interface SignOutDialogProps {
    onClose: () => void
    open: boolean
    anchor?:any
    toggleDrawer?: (anchor:any, open:boolean, event:any) => void

}

export function logOutFunction (){
    localStorage.removeItem(timer)
    localStorage.removeItem(myUid)
    localStorage.removeItem(url)
    localStorage.removeItem(nickname)
    localStorage.removeItem(admin)
    localStorage.removeItem(inactive)
    localStorage.removeItem(gender)
    localStorage.removeItem(stripeConnectAccount)
    localStorage.removeItem(video_verification)
    localStorage.removeItem(rbac)
    localStorage.removeItem(tele_id)
    localStorage.removeItem(block)
    localStorage.removeItem(adminPageTab)

    localStorage.removeItem(filterDrinks)
    localStorage.removeItem(filterProfile)
    localStorage.removeItem(filterGender)
    localStorage.removeItem(filterPrice)
    localStorage.removeItem(filterRace)
    localStorage.removeItem(sortByRatings)
}

const SignOutDialog: React.FC<SignOutDialogProps> = ({onClose, open, anchor, toggleDrawer}) => {

    const { t } = useTranslation()
    const setCurrentUser = useUser((state) => state.setCurrentUser);

    return <Dialog

    open={open}
    onClose={onClose}
    >
        <DialogTitle>{t('signout.button')}</DialogTitle>
            <DialogContent sx={{minWidth: 300}}>
                <DialogContentText>
                    {t('signout.dialog')}
                </DialogContentText>
            </DialogContent>

            <DialogActions>

            <Button variant="contained" color="inherit" onClick={onClose} >
                {t('cancel.button')}
            </Button>

            <Button variant="contained" color="error" onClick={async (e) => {
                
                toggleDrawer?.(anchor, false, e)

                onClose()

                await auth.signOut()
                logOutFunction()
                window.location.href = `${window.location.origin}`

                setCurrentUser(undefined)
                
            }}>
      {t('signout.button')}
            </Button>

        </DialogActions>
    </Dialog>

}

export default (SignOutDialog);