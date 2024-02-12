


import { Typography } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const RefundHint : FC = () => {

  const { t } = useTranslation()

    return <Typography
        sx={{marginTop: 1}}
        align="center" 
        fontSize={10} 
        color="text.secondary" 
        variant='caption'>
        {t("refund.disclaimer")}
  </Typography>
}

export default RefundHint