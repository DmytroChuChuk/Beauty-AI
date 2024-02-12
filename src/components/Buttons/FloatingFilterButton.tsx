import { FC } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FlexGap from '../Box/FlexGap';
import CenterFlexBox from '../Box/CenterFlexBox';


const FloatingFilterButton : FC<{onClick: () => void}> = ({onClick}) => {

  const [ t ] = useTranslation()

    return <CenterFlexBox onClick={onClick} bgcolor="black" height="44px" padding="0px 16px" borderRadius="24px">

      <img width={19} height={19} src = "https://images.rentbabe.com/assets/flaticon/filterwhite.svg" alt=""/>

      <FlexGap gap={5}/>

        <Typography 
          fontWeight={500} 
          color="primary"
          >{t("filter")}
        </Typography>
 
    </CenterFlexBox>
 
}

export default FloatingFilterButton