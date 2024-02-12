import { Avatar, Box, Card, CardHeader, CircularProgress, InputAdornment, TextField, Typography } from '@mui/material';
import { getDocs, query, collection, where, limit } from 'firebase/firestore';
import React, { useState } from 'react';
import { USERS } from '../../keys/firestorekeys';
import { analytics, db } from '../../store/firebase';
import { nickname as nicknameKey } from '../../keys/firestorekeys';
import { Item } from '../../keys/props/profile';
import { Helper } from '../../utility/Helper';
import { logEvent } from 'firebase/analytics';
import { AnalyticsNames } from '../../keys/analyticNames';

interface props {
    currentNickname?: string | undefined
}

const SearchCard : React.FC <{
    user: Item
}> = ({user}) => {

    const helper = new Helper()

    const onClick = () => {
        window.open(`${window.location.origin}/Profile?uid=${user.uid}`, "_blank")
    }

    return <Card elevation={4} onClick={onClick} sx={{cursor: "pointer"}}>
        <CardHeader
            avatar={
                <Avatar
                    src={user.mobileUrl}
                    variant='circular'
                />
            }
            title = {`@${user.nickname}`}
            subheader= {<Typography color="error" variant='caption'>
                {`Last seen ${ (helper.timeSince(user?.time_stamp?.toDate()) ).toLowerCase() } ago`}
            </Typography>}
        />
    </Card>
}

const SearchUsernameInput : React.FC <props> = ({currentNickname}) => {

    const [nickname, setNickname] = useState<string>()
    const [time, setTime] = useState<any>(null)
    const [reset, setReset] = useState(false)
  
    const [data, setData] = useState<Item | undefined>()

    return <Box>
      
        <TextField
            type="search"
            size='small' 
            color="secondary"
            fullWidth
            label={
                <Typography textTransform="none">Enter a username</Typography>
            }
            InputProps={{
                endAdornment: <InputAdornment position="end">
                    {!!time && <CircularProgress className = "circle-progress" size = {16} color = "secondary" /> }
                </InputAdornment>
            }}
            style={{textTransform: "capitalize"}} 
            inputProps={{ 
                maxLength: 20
            }}
            helperText= {
                (!time && !data && nickname) ? reset ? "" : "Not found" : data && <SearchCard
                    user={data}
                />
            }
            defaultValue={currentNickname}
        onChange={(e) => {

            let text = ((e.target as HTMLInputElement).value).toLowerCase()

            setData(undefined)
            clearTimeout(time)
            setTime(null)
            setReset(false)

            if(!text) {
                setReset(true)
                return
            }

            //check server
            setTime(setTimeout(async () => {
                let isValid = true
                const nameRegex = /^[a-z\-]+$/;  // eslint-disable-line
                if(text.match(nameRegex) === null || text.length < 3){
                    isValid= false
                    //setErrorMessage("username must contains a-z. NO spacing, NO numbers. Minimum length is 3 characters.")
                }else if(nickname === 'undefined'){
                    isValid = false
                    //setErrorMessage("This username is not available. Please try again.")
                }else{
                    const snap = await getDocs(query(collection(db, USERS) 
                    , where(nicknameKey, "==" , text) 
                    , limit(1)))

                    if(snap.docs.length !== 0){
                        const doc = snap.docs[0]
                        const helper = new Helper()
                        const item = helper.convertToItem(doc)
                        setData(item)

                    }
                }
                if(isValid){
                    try{
                        logEvent(analytics, AnalyticsNames.username, {
                            username: text,
                        })  
                    }catch{}
                    setNickname(text)
                }else{
                    setData(undefined)
                }
                setTime(null)
            }, 1200))

            }}>
        </TextField>
    </Box>
}

export default SearchUsernameInput;