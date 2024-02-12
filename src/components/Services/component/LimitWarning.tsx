import { Typography } from '@mui/material';
import { FC } from 'react';
import { operator } from '../../../enum/MyEnum';

interface props {
    client?: string | null | undefined
    nickname?: string | null | undefined
    walletLimit: number | undefined
    spendLimit: number | undefined
    operatorState: operator | undefined
}

const LimitWarning : FC<props> = ({
    client, 
    nickname,
    walletLimit, 
    spendLimit, 
    operatorState
}) => {

    return <Typography>Hi {client ? client.capitalize() : "[client]"} 👋🏻
    <br/>
    <br/>
    I have set certain restriction to my profile to prevent spammed messages.&nbsp;

    {walletLimit ? <>You will need at least <b>{(walletLimit/100).toFixed(2)}</b> credit balance in your wallet</> : ""}
    <b>{operatorState !== undefined && `${operatorState === operator.both ? " AND " : " OR "}`}</b>
    {spendLimit ? <>you will need to spend at least <b>{(spendLimit/100).toFixed(2)}</b> credit on the platform</> : ""}    
    
    &nbsp;in order to start a conversation with me.

    <br/>
    <br/>
    Thank you,
    <br/> 
    {nickname ? nickname.capitalize() : "[nickname]"}
    </Typography>
 
}

export default LimitWarning