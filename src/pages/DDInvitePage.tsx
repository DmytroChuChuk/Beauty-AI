import { Box, Button, Card, CardContent, CircularProgress, DialogActions, Typography } from '@mui/material';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import React, { FC, useEffect, useState } from 'react';
import shallow from 'zustand/shallow';
import CenterSnackBar from '../chats/components/Snackbar/CenterSnackBar';
import CenterFlexBox from '../components/Box/CenterFlexBox';
import { BabeButton } from '../components/Buttons';
import LoadingScreen from '../components/Loaders/LoadingScreen';
import CountDown from '../components/Timer/CountDown';
import UserCardAvatar from '../components/User/UserCardAvatar';
import { rentbOrange } from '../keys/color';
import { INVITE } from '../keys/firestorekeys';
import { inviteDoubleDatesv1Function } from '../keys/functionNames';
import { InviteProps } from '../keys/props/common';
import { useUser } from '../store';
import { db, functions } from '../store/firebase';
import { DDInviteLinkExpire } from '../version/basic';
import LoginPage from './LoginPage';


const DDInvitePage : FC = () => {



    const inviteId = window.location.href.getQueryStringValue("id")
    const [ myUUID ] = useUser((state) => [state.currentUser?.uid], shallow)
    const [ isLoading, setLoading ] = useState<boolean>(false) 
    const [ error, setError ] = useState<boolean>(false) 
    // const [linkExpire, setExpire] = useState<Timestamp>()
    const [inviteData, setInviteData] = useState<InviteProps | undefined>()
    const [ hasExpired, setHasExpiried ] = useState<boolean>(false) 

    const [ isChecking, setChecking ] = useState<boolean>(false) 

    const [ alert , setAlert ] = useState<boolean>()
    const [ msg , setMsg ] = useState<string>()
    const [ action , setAction ] = useState<React.ReactNode>()


    function openAlert(msg: string, node?: React.ReactNode){
        setAction(node)
        setAlert(true)
        setMsg(msg)
    }

    useEffect(() => {

        if(myUUID && inviteId){
            setLoading(true)
            getDoc(doc(db, INVITE, inviteId)).then((snap) => {

                const data = snap.data() as InviteProps
                setInviteData(data)
                // const timeStamp =  data.t as Timestamp

                // setExpire(timeStamp)

            }).catch((err) => {
                console.log(err)
                setError(true)

            }).finally(() => {
                setLoading(false)
            })
        }

        // eslint-disable-next-line
    } , [myUUID])

    const onAccept = async () => {



        setChecking(true)

        const inviteDoubleDatesv1 = httpsCallable(functions, inviteDoubleDatesv1Function)

        try{
            const res = await inviteDoubleDatesv1({
                inviteId: inviteId
            })
    
            const json = res.data as any
            const status = json.status
            const message = json.message


            openAlert(message, status === 500 ? <BabeButton bgcolor={`${rentbOrange}!important`}/> : undefined)

            if(status === 200){
                window.location.href = `/page/Admin?=uid${myUUID}`
            }

        }catch(error){
            console.log(error)
            openAlert(`${error}`)
        }


        setChecking(false)
        
    }   


    if(!myUUID) return <LoginPage dontRedirect/>
    else if(isLoading || !inviteData) return <LoadingScreen/>
    else if(error) return <CenterFlexBox height="100vh">
        <Typography>Unexpected error</Typography>
    </CenterFlexBox>
    // please check if host has already added anyone, ask them to remove
    else return <CenterFlexBox className='chat-background' flexDirection="column" bgcolor="white" height="100vh">

        <Card>
            

            <CardContent>

                <Box>

                    <UserCardAvatar 
                        uid={inviteData.sen} 
                        isAnnon={false}            
                    />
                    <Typography>You are being invited you to join this user's Double Date services.</Typography>

                </Box>

                {(inviteData?.t && !inviteData.joined) ? <> 
                    <br/> 
                <Typography color="error" variant='caption'>{!hasExpired && "Invite expires at "}<CountDown 
                    date={(inviteData?.t as Timestamp)?.toDate()} 
                    minutesToExpire={DDInviteLinkExpire} 
                    hasExpired={() => {
                        setHasExpiried(true)
                    }}
                /></Typography> 

                </> : <>
                    {
                        inviteData.joined && <Typography color="error" variant='caption'>Someone has accepted this invite.</Typography>
                    }
                </>}

                { !inviteData.joined && <DialogActions>
                    <Button onClick={onAccept} disabled={hasExpired || isChecking || inviteData.joined} variant='contained' color="success" endIcon={
                        isChecking && <CircularProgress size={12} color="secondary"/>
                    }>Accept</Button>
                </DialogActions> }
            </CardContent>
            
        </Card>

        <CenterSnackBar
            open={alert}
            message={msg}
            action={action}
            autoHideDuration={2000}
            onClose={() => setAlert(false)}
        />


    </CenterFlexBox>
 
}

export default DDInvitePage