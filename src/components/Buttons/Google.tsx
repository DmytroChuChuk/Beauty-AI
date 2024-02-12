import { FC, useState } from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { auth } from '../../store/firebase';
import CenterSnackBar from '../../chats/components/Snackbar/CenterSnackBar';
import { GoogleAuthProvider, linkWithRedirect } from 'firebase/auth';
import { useUser } from '../../store';

interface props extends ButtonProps{

}

const Google : FC<props> = ({  ...props}) => {


    const [email] = useUser((state) => [state.currentUser?.email])
    
    const [toastMsg, setToastMsg] = useState<string>("Saved")
    const [showToast, setShowToast] = useState<boolean>(false)

    const [isLoading, setGoogleLoading] = useState<boolean>(false)


    function censor(value: string | null | undefined) {

        if(!value) return ""

        const n = Math.ceil(value.length/2);
        const rest = value.length - n;

        return value.slice(0, Math.ceil(rest / 2) + 1) + '*'.repeat(4) + value.slice(-Math.floor(rest / 2) + 1);
    };

    const linkOnClick = () => {
        
        if(isLoading) return
        if(!auth.currentUser) return

        const provider = new GoogleAuthProvider();
        setGoogleLoading(true)
        
        linkWithRedirect(auth.currentUser, provider)
        // .then((result) => {

        //     const user = result.user;
        //     const _email = user.email

        //     if(_email){
        //         localStorage.setItem(emailKey, _email)
        //         setUser({email: user.email})
        //         setToastMsg("Gmail connected")
        //         setShowToast(true)
        //     }else {
        //         localStorage.removeItem(emailKey)
        //         setUser({email: undefined})
        //         setToastMsg("Connection error")
        //         setShowToast(true)
        //     }

        // })
        .catch((error) => {
            console.log(error.code)
            setToastMsg(error.code)
            setShowToast(true)

        }).finally(() =>  setGoogleLoading(false))

        // .then(() => {

        //     // const user = result.user;
        //     // const _email = user.email

        //     // if(_email){
        //     //     localStorage.setItem(emailKey, _email)
        //     //     setUser({email: user.email})
        //     //     setToastMsg("Gmail connected")
        //     //     setShowToast(true)
        //     // }else {
        //     //     localStorage.removeItem(emailKey)
        //     //     setUser({email: undefined})
        //     //     setToastMsg("Connection error")
        //     //     setShowToast(true)
        //     // }

        // })
    }

    return <>
    
    <Button 
    {...props}
    disabled={!!email}
    color={email ? "warning" : "primary"}
    onClick={linkOnClick}
    variant="contained" 
    startIcon={
        !email && <img
        width={21}
        height={21} 
            src="https://images.rentbabe.com/assets/logo/google.svg"
            alt=""
        />
    } 

    endIcon={
 
        isLoading ? <CircularProgress size={12} color="secondary"/> : email && <img
        width={21}
        height={21} 
            src="https://images.rentbabe.com/assets/mui/green_tick.svg"
            alt=""
        />
    
    }>{email ? `${censor(email)}` : "Connect"}</Button>
    
    <CenterSnackBar
        open={showToast}
        onClose={() => setShowToast(false)}
        autoHideDuration={2500}
        message={toastMsg}/> 
    </>
 
}

export default Google