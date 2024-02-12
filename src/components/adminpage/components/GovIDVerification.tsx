import { FC, useState } from 'react';
import AdminVerifiedRequest from './AdminVerifiedRequest';
import { useTranslation } from 'react-i18next';
import FlexGap from '../../Box/FlexGap';

interface props {
    isVerified: boolean | undefined
    myUID: string | null | undefined
    rejectedReasonAfter: string | null | undefined
}

const GovIDVerification : FC<props> = ({myUID, rejectedReasonAfter, isVerified}) => {


    const [ t ] = useTranslation()

    const [ isOpen , setOpen ] = useState<boolean>(false)


    const onClick = () => {
        if(!isVerified) setOpen(true)
    }

    const onClose = () => {
        setOpen(false)
    }
    

    return <div>

        <div className="insta-container">
            <div className="insta-item">
                <AdminVerifiedRequest 
                    onClick={onClick}
                    isOpen={isOpen}
                    onClose={onClose}
                    isVerified={isVerified} myUID={myUID} rejectedReasonAfter={rejectedReasonAfter}
                />
            </div>

            <FlexGap/>
         
            <div className="insta-item" >
                <p>Government Issued ID</p>
            </div>
           {isVerified ? <img alt="" src = "https://images.rentbabe.com/assets/mui/green_tick.svg" className="green_tick"/> :
                <div className="insta-item-end" onClick={onClick} >
                    <small style={{ color:  "#3572ff"}}>{ isVerified === false ? "UPDATE" : "SUBMIT"}</small>
                </div>
            }
        </div>
        {
            isVerified === false ?  <label className="insta-btm-label">*It takes within 48 hours for verification</label> : <label 
            className="insta-btm-label">
                { isVerified ?  "" : `${t("verified.badge")}` }
            </label>
        }
    </div>
 
}

export default GovIDVerification