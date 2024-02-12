import { TypographyProps } from '@mui/material';
import { doc } from 'firebase/firestore';
import { FC, useEffect } from 'react';
import { useDocumentQuery } from '../../../../../hooks/useDocumentQuery';
import { balance, CREDIT } from '../../../../../keys/firestorekeys';
import { useUser } from '../../../../../store';
import { db } from '../../../../../store/firebase';
import CreditAmount from '../CreditAmount';

interface props extends TypographyProps{
    creditBalance?: (balance: number) => void
}
const GetCreditBalance : FC<props> = ({creditBalance, ...props}) => {

    const [ uid ] = useUser((state) => [state.currentUser?.uid])

    const { loading, data } = useDocumentQuery(`${uid}-balance`, doc(db, CREDIT, uid ?? "empty"))

    useEffect(() => {

        if(!loading){
            let value = 0
            if(data) value = (data?.get(balance) as number) ?? 0
            creditBalance?.(value)
        }
        // eslint-disable-next-line
    }, [loading, data])

    return <CreditAmount
        {...props}
        amount={loading ? undefined : (data?.get(balance) as number) ?? 0}
    />
 
}

export default GetCreditBalance