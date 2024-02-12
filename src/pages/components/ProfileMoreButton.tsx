import { CircularProgress, IconButton } from '@mui/material';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CenterFlexBox from '../../components/Box/CenterFlexBox';
import MyMenu from '../../components/menuList/components/MyMenu';
import BasicMenuItem from '../../components/Profile/BasicMenuItem';
import { iconImageSize } from '../../dimensions/basicSize';

interface props {
    isLoading?: boolean
    shareButtonClick: () => void
    reportButtonClick: () => void
}

const ProfileMoreButton : FC<props> = ({isLoading = false, shareButtonClick, reportButtonClick}) => {

    const [ t ] = useTranslation()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: any) => {
      setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
      setAnchorEl(null)
    }


    return <CenterFlexBox >

        <IconButton  disabled={isLoading} onClick={handleClick}>
            {
                isLoading ? <CircularProgress
                    size={19}
                    color="primary"
                /> :  <img
                height={16}
                width={16}
                src="https://images.rentbabe.com/assets/icon/more.svg"
                alt=""
            />
            }

        </IconButton>

        <MyMenu 
            anchorEl={anchorEl}
            onClick={handleClose}
            open={open}
            onClose={handleClose}>
            <BasicMenuItem 
                title={t('share.button')}
                iconImageSize={iconImageSize} 
                imageUrl="https://images.rentbabe.com/assets/mui/logout.svg"
                onClick={shareButtonClick}            
              />
            <BasicMenuItem 
                title={t('report.button')} 
                iconImageSize={iconImageSize} 
                imageUrl="https://images.rentbabe.com/assets/mui/cancel.svg"
                onClick={reportButtonClick}            
              />
        </MyMenu>

    </CenterFlexBox>
 
}

export default ProfileMoreButton