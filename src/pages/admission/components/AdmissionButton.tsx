import { Button, CircularProgress } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../../store';

interface props {
    index: number
    isFinal?: boolean
    isLoading: boolean
    onClickNext: () => void
}

const AdmissionButton : FC<props> = ({index, isLoading, onClickNext, isFinal = false}) => {

    const [ t ] = useTranslation()
    const [isAdmin] = useUser((state) => [state?.currentUser?.isAdmin])
    
    return <Button 
    fullWidth
    sx={{maxWidth: 480}} 
    color="secondary" 
    onClick={onClickNext}
    variant='contained'
        >{isLoading ? <CircularProgress size={21}/> : isFinal ? `${isAdmin === false ?`${t("update.app.button")}`: `${t("submit.app.button")}`}` 
        : `${t("next.button")} ${index}/5`}</Button>
 
}

export default AdmissionButton