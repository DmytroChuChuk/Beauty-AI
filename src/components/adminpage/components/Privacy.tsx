import { Select, MenuItem, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { profile } from '../../../enum/MyEnum';

interface props {
    privacy: number | undefined
    onChange: (e : any) => void
}

// Everybody can see your profile. We will also share your profile to our social media and markerting campaigns.
// Only users that paid for monthly subcriptions will be able to see your profile

const Privacy: FC<props> = ({privacy : _privacy, onChange}) => {

    const [ t ] = useTranslation()
    const [privacy , setPrivacy] = useState<number | undefined>(_privacy)

    useEffect(() => {setPrivacy(_privacy)} , [_privacy])


    return   <div>

    <Typography variant='caption' color={privacy === 0 ? "success.main" : "error"}  >

    {privacy === profile.public ? `${t("public.profile.desc")}` : `${t("private.profile.desc")}`}

    </Typography>


    <br/>
    <br/>
    
    <Select 
        fullWidth
        color='secondary'
        placeholder="Select One" 
        value = {privacy ?? 0} 
        onChange={onChange}>
        <MenuItem value={0}>Public</MenuItem>
        <MenuItem value={1}>Private</MenuItem>
    </Select>   
    </div>
 
}

export default (Privacy);