import { Card, CardContent, Typography, CardActions, Button } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const BasicCard : FC = () => {

    const { t } = useTranslation()

    return <Card sx={{ minWidth: 275, maxWidth: 400, maxHeight: 275 , marginTop: '5em'}} >
    <CardContent>
      <Typography  >
      {t('platform.disclaimer')}
      </Typography>
    </CardContent>
    <br/>
    <CardActions>
      <Button href="./page/Rent" color = "secondary" size="small">Rent NOW</Button>
      <Button href="./page/FAQ" color = "secondary" size="small">FAQ</Button>
      <Button href="./page/Terms" color = "secondary" size="small">Terms of service</Button>
    </CardActions>
  </Card>
 
}

export default BasicCard