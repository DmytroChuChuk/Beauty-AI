import { FC } from 'react';
import FlexBox from '../Box/FlexBox';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';


const FilterButton : FC = () => {

  const [ t ] = useTranslation()

    return <FlexBox bgcolor="#ededed" padding="2px 12px" borderRadius={2}>
        <Typography 
          fontWeight="bold" 
          variant='caption' 
          // color="secondary.main"
          marginRight={.5}
          >{t("filter")}
        </Typography>
        <img width={19} height={19} src = "https://images.rentbabe.com/assets/flaticon/filterblack.svg" alt=""/>
    </FlexBox>
 
}

export default FilterButton