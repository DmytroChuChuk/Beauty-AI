import { FC } from 'react';
import history from '../../utility/history';

import { useTranslation } from 'react-i18next';

import '../../scss/components/Buttons/button.scss';
import { Helper } from '../../utility/Helper';
import CenterFlexBox from '../Box/CenterFlexBox';


const LoginButton : FC<{
    className?: string
}> = ({className = ""}) => {

    const { t } = useTranslation()
    const helper = new Helper()

    const onClick = () => {
        history.push("/Login", {openAdminPage: false})
    }

    return <CenterFlexBox 
            className = {`${helper.isMobileCheck2() ? "login-button-mobile" : "login-button"} ${className} ` }  
            onClick={onClick}
        >
        {t("login.button")}
    </CenterFlexBox>
 
}

export default LoginButton