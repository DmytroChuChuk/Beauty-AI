import { FormControl, RadioGroup, FormControlLabel, Radio, Typography } from '@mui/material';
import { ChangeEvent, FC } from 'react';
import shallow from 'zustand/shallow';
import { payBy } from '../../../enum/MyEnum';
import { useUser } from '../../../store';

interface props {
    onChange: (event: ChangeEvent<HTMLInputElement>, value: string) => void
}

const ChoosePaymentMethod : FC<props> = ({onChange}) => {

  const [isPremium] = useUser((state) => [state.currentUser?.isPremium], shallow)

    return  <FormControl>

    <RadioGroup 
        row
        onChange={onChange}
        defaultValue={payBy.paynow}
    >
      <FormControlLabel value={payBy.paynow} control={<Radio color="warning" />} label={
          <Typography variant='caption'>{`PayNow (${isPremium ? "0" : "0"}% fee)`}</Typography>
        }
      />
      <FormControlLabel value={payBy.grabpay} control={<Radio color="warning"  />} label={
          <Typography variant='caption'>{`GrabPay (${isPremium ? "0" : "4"}% fee)`}</Typography>
        }
      />
      <FormControlLabel value={payBy.card} control={<Radio color="warning"  />} label={
        <Typography variant='caption'>{`Credit Card (${isPremium ? "0" : "4"}% fee)`}</Typography>
      }/>
    </RadioGroup>
  </FormControl>
 
}

export default ChoosePaymentMethod