import { Box, Button } from '@mui/material';
import { FC } from 'react';
import { chatGray } from '../../../keys/color';
import { useTranslation } from 'react-i18next';

interface props {
    join: boolean
    isAdmin: boolean | null | undefined
    loadingStatus: boolean
    myNickname: string | null | undefined
    onSaveButtonClick: () => void
    onDeleteButtonClick: () => void
}

const AdminPageFooter : FC<props> = ({
    join, isAdmin, loadingStatus, myNickname, 
    onSaveButtonClick, onDeleteButtonClick
}) => {

    const { t } = useTranslation()

    return <Box 
        position="fixed"
        display="flex"
        bottom={0}
        left={0}
        right={0}
        padding={1}
        bgcolor="white"
        zIndex={999}
        maxWidth={500}
        marginLeft="auto"
        marginRight="auto"
        borderTop={`1px solid ${chatGray}`}>
        
        <Button disabled={loadingStatus} variant="contained" color="secondary" 
            onClick={onSaveButtonClick}>
                {(isAdmin === undefined && join)  ? `${t("submit.button", "Submit")}` : `${t("save.button", "Save")}`}
        </Button>

        {/* <Button  className="admin-btns"  variant="contained" color="secondary" onClick={() => {
            history.goBack()
        }}>Close</Button> */}

        {
            myNickname && <>
             <Button style={{marginLeft: "auto", marginRight: "16px"}}  className="admin-btns"  
                variant="contained" color="error" onClick={onDeleteButtonClick}>{t("delete.account.button", "Delete Account")}</Button>
            </>    
        }
    </Box>
 
}

export default AdminPageFooter