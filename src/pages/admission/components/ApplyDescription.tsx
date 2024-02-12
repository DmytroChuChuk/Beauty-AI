import { Typography } from '@mui/material';
import { FC } from 'react';
import { CountryLookUpTable } from '../../../data/tables';
import { state, club } from '../../../keys/firestorekeys';


const ApplyDescription : FC = () => {

    const queryState = sessionStorage.getItem(state)
    const queryClub = sessionStorage.getItem(club)

    return <>{(queryState && queryClub) && 
        <Typography textAlign="center" variant='caption' color="text.secondary" marginTop={1}>You are joining as a babe at <b>@{queryClub}</b> page from the <b>{
            Object.keys(CountryLookUpTable).find(k=>CountryLookUpTable[k]===queryState)
        }</b></Typography>}
    </>


}

export default ApplyDescription