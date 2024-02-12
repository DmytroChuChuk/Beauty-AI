import { CircularProgress, InputAdornment, TextField, Typography } from '@mui/material';
import { getDocs, query, collection, where, limit } from 'firebase/firestore';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {  USERS, nickname as nicknameKey } from '../../../keys/firestorekeys';

import { db } from '../../../store/firebase';


interface props {
    myUid: string
    currentNickname: string | undefined
    disabled: boolean
    onSuccess: (nickname: string | undefined) => void
}


// <Typography>Username {!!time ? <CircularProgress className = "circle-progress" size = {12} color = "secondary" /> : <>{!errorMessage && nickname ? <img src = "https://images.rentbabe.com/assets/mui/check.svg" className="check_tick" alt= ""/> : null}</>}</Typography>
const Nickname : React.FC <props> = ({currentNickname , disabled, myUid, onSuccess}) => {

    const [ t ] = useTranslation()
    const [nickname, setNickname] = useState<string>();
    const [time, setTime] = useState<any>(null)
    const [errorMessage, setErrorMessage] = useState<string>();

    return <div >
      
        <TextField 
        color="secondary"
        fullWidth
        label={t("username.label")}
        helperText={
            !errorMessage && !time && nickname ? <Typography variant='inherit' color="success.main">
                Available.
            </Typography> : <Typography variant='inherit' color="error">{errorMessage}</Typography>
        }
        InputProps={{
            endAdornment: <InputAdornment position="end">
                {!!time && <CircularProgress className = "circle-progress" size = {16} color = "secondary" /> }
            </InputAdornment>
        }}
        style={{textTransform: "capitalize"}} 
        type="text" 
        inputProps={{ 
            maxLength: 20
        }}
        disabled={disabled} 
        defaultValue={currentNickname}
        onChange={(e) => {

        var text = ((e.target as HTMLInputElement).value).toLowerCase();
        // if(text === nickname){
        //     return
        // }
      
        clearTimeout(time)
        setTime(null)
        setErrorMessage(undefined)
        onSuccess(undefined)
    
        // setNickname(undefined)

        //check server
        setTime(setTimeout(async () => {
            let isValid = true
            const nameRegex = /^[a-z\-]+$/;  // eslint-disable-line
            if(text.match(nameRegex) === null || text.length < 3){
                isValid= false
                setErrorMessage("username must contains a-z. NO spacing, NO numbers. Minimum length is 3 characters.")
            }else if(nickname === 'undefined'){
                isValid = false
                setErrorMessage("This username is not available. Please try again.")
            }else{
                const snap = await getDocs(query(collection(db, USERS) 
                , where(nicknameKey, "==" , text) 
                , limit(1)))

                if(snap.docs.length !== 0){
                    const uid = snap.docs[0].id
                    if(uid !== myUid){
                        setErrorMessage("This username is not available. Please try again.")
                        isValid = false
                    }
                }
            }

            if(isValid){
                setNickname(text)
                onSuccess(text)
            }

            setTime(null)

            }, 1200))

            }}>

        </TextField>
    </div>
  

}

export default Nickname;