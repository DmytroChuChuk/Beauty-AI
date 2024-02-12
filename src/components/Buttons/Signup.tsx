import { FC } from 'react';
import history from '../../utility/history'
import '../../scss/components/Buttons/button.scss'
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

const SignUpButton: FC<{
    className?: string
}> = ({className = ""}) => {

    const { t } = useTranslation();

    const onClick = () => {
        history.push("/Login", {openAdminPage: true})
    }

    return <Box className = {`signup-button ${className}`}  onClick={onClick}>
        {t("signup.button")}
    </Box> 
 
}

export default SignUpButton