import { Box, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { FC } from 'react';
import PageHeader from '../components/Headers/PageHeader';
import MyAppBar from '../components/MyAppBar';
import TelegramAlert from '../components/Notifications/TelegramAlert';
import SessionHistory from '../components/Order/OrderHistory';
import { RBAC } from '../enum/MyEnum';
import { cardGray } from '../keys/color';
import { useUser } from '../store';
import { useTranslation } from 'react-i18next';


const SessionPage : FC = () => {

    enum SelectEnum {
        ALL_ORDERS = -1,
        F2F = 97,
        F2F_COMPLETED = 96,
        PENDING_REFUND_ORDER = 98,
        EMEET_ORDER = 99,
        MEALS = 1
    }

    const [ t ] = useTranslation()

    const [userRBAC, isBlock] = useUser((state) => [
        state?.currentUser?.userRBAC,
        state?.currentUser?.isBlock,
    ])

    const onChange  = (event: SelectChangeEvent) => {
        const value = event.target.value as string
        const v = parseInt(value)
        const baseURI = "/trade?admin=true"

        switch (v) {
            case SelectEnum.ALL_ORDERS:
                    window.location.href = baseURI
                break;

                case SelectEnum.EMEET_ORDER:
                    window.location.href = `${baseURI}&emeet=${v}`
                break;

                case SelectEnum.PENDING_REFUND_ORDER:
                    window.location.href = `${baseURI}&refund=true`
                break;

                case SelectEnum.MEALS:
                    window.location.href = `${baseURI}&meetup=${v}`
                break;

                case SelectEnum.F2F:
                    window.location.href = `${baseURI}&f2f=true`
                break;

                case SelectEnum.F2F_COMPLETED:
                    window.location.href = `${baseURI}&f2f=completed`
                break;
        
            default:
                break;
        }

        // if(v === SelectEnum.ALL_ORDERS){
        //     window.location.href = baseURI
        // }else if (v === SelectEnum.EMEET_ORDER) {
        //     window.location.href = `${baseURI}&emeet=${v}`
        // }
        // else if (v === SelectEnum.PENDING_REFUND_ORDER) {
        //     window.location.href = `${baseURI}&refund=true`
        // }
        // else{
        //     window.location.href = `${baseURI}&meetup=${v}`
        // }
    }

    if (isBlock) return <></>

    return <Box
        className="chat-background" 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        width="100%"
        height="100vh"
        padding="0 8px"
        bgcolor={cardGray} 
    >

    <MyAppBar/>

    <TelegramAlert/>

    <PageHeader title={t("SERVICE.ORDERS")} />
    {userRBAC === RBAC.admin && <Select 
    onChange={onChange} 
    color="warning" 
    defaultValue={SelectEnum.ALL_ORDERS.toString()} 
    placeholder='select order'>
        <MenuItem  value={SelectEnum.ALL_ORDERS}>All order</MenuItem>
        <MenuItem  value={SelectEnum.F2F}>All F2F meetups</MenuItem>
        <MenuItem  value={SelectEnum.F2F_COMPLETED}>F2F Completed F2F</MenuItem>
        <MenuItem  value={SelectEnum.MEALS}>Meals order</MenuItem>
        <MenuItem  value={SelectEnum.PENDING_REFUND_ORDER}>Pending refund order</MenuItem>
        <MenuItem  value={SelectEnum.EMEET_ORDER}>EMeet order</MenuItem>
    </Select>}

    <SessionHistory/>
    
    </Box>
 
}

export default SessionPage