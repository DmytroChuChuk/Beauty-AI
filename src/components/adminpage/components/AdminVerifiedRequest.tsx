
import { FC } from 'react';
import GovDialog from '../../Dialogs/Verification/GovDialog';
import MobileTooltip from '../../Tooltip/MobileTooltip';
import { useTranslation } from 'react-i18next';

interface props {
    myUID: string | null | undefined
    rejectedReasonAfter: string | null | undefined
    isVerified?: boolean | undefined
    isOpen : boolean
    onClose: () => void
    onClick: () => void
}

const AdminVerifiedRequest : FC<props> = ({myUID,  rejectedReasonAfter, isVerified , isOpen, onClose, onClick}) => {

    const [ t ] = useTranslation()

    return <>
        <MobileTooltip
            title={t("verified.badge")}
        >
            <img 
                style={{opacity: isVerified ? '1' : '0.32', cursor: "pointer"}} 
                onClick={onClick} 
                width={24} 
                src="https://images.rentbabe.com/assets/flaticon/card.svg" 
                alt="" 
            />
        </MobileTooltip>
        <GovDialog 
            open={isOpen}
            onClose={onClose} myUID={myUID} verified={isVerified} rejectedReasonAfter={rejectedReasonAfter}/>

    </>
 
}

export default AdminVerifiedRequest