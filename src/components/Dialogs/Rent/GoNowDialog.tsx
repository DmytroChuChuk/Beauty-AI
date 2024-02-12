import  React ,  { useState, useRef } from 'react';

import {Button, TextField, Dialog, DialogActions, DialogContent, 
  DialogContentText,
  DialogTitle,
  Box,
  Tab,
  Tabs
} from '@mui/material';

import './GoNowDialog.scss';
import { useTranslation } from 'react-i18next';
import { ServiceType } from '../../../keys/props/services';

export interface ConfirmationDialogRawProps {
  open: boolean;
  onClose: (from?: Date , to?: Date, bio?: string, comingFrom? : string, serviceType?: ServiceType) => void;
}
  

export default function GoNowDialog(props: ConfirmationDialogRawProps) {

  const { onClose, open } = props;
  const { t } = useTranslation()

  const [bio, setBio] = useState<string>();

  const from = useRef<string>();
  const to = useRef<string>();
  const info = useRef<string>();
  const coming = useRef<string>();

  const [value, setValue] = React.useState<ServiceType>(ServiceType.meetup);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [err, setErr] = useState<string>();

  React.useEffect(() => {

      generateBio()
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value])

  function generateBio(){

    const fromText = from.current ? from.current : "time?"
    const toText = to.current  ? to.current : "time?"

    const comingText = value === ServiceType.meetup ? 
    (coming.current ? `coming from ${coming.current}` : "coming from where?") : 
    value === ServiceType.games ? "for Games" :
    value === ServiceType.eMeet ? "for E-Meet" : "coming from Where?"

    const infoText = info.current ? info.current : ""

    const convertFromText = tConvert(fromText)
    const convertToText = tConvert(toText)

    const total = t("setfreetoday.label", {
      convertFromText: convertFromText,
      convertToText: convertToText,
      comingText: comingText,
      infoText: infoText

    }) // `I am free today from ${convertFromText} to ${convertToText}, coming from ${comingText}. ${infoText}`

    setBio(total) 
  
  }

  function tConvert (time: any) {
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  
    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
  }


  return (
      <Dialog fullWidth open={open} onClose={ () => {onClose(undefined, undefined, undefined)} }>

        <DialogTitle>{bio}</DialogTitle>

        <DialogContent>

          <div className = "duration">

          <div>

            <p>
              From
            </p>
          
            <input type="time" onChange = {(e) => {

                const value = (e.target as HTMLInputElement).value
                from.current = (value)
                generateBio()

            }}/>

            </div>
   
            <div>

            <p>
              To
            </p>

            <input type="time" onChange={(e) => {
              const value = (e.target as HTMLInputElement).value
              to.current = (value)
              generateBio()
            }}/>

            </div>

          </div>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            textColor='secondary' 
            indicatorColor='secondary' 
            value={value} 
            onChange={handleChange}
          >
            <Tab label="Meetup"/>
            <Tab label="E-Meet"/>
            <Tab label="Games"/>
          </Tabs>
        </Box>


       { value === ServiceType.meetup && <TextField
          autoComplete='off'
          inputProps={{ maxLength: 15 }}
          autoFocus
          margin="dense"
          label={t('comingfrom.label')}
          fullWidth
          color='secondary'
          variant="standard"
          onChange = {(e) => {
            coming.current = ((e.target as HTMLInputElement).value)
            generateBio()
          }}
        /> }


          <TextField
            autoComplete='off'
            color='secondary'
            inputProps={{ maxLength: 30 }}
            autoFocus
            margin="dense"
            label={ `${t('remarks.label')} (${t('optional.label')})` }
            fullWidth
            variant="standard"
            onChange = {(e) => {
              info.current = ((e.target as HTMLInputElement).value)
              generateBio()
            }}/>

          <br/>
          <br/>

          <DialogContentText color='error'>
              {err}
          </DialogContentText>

        </DialogContent>

        <DialogActions>
       
          <Button variant = "contained" color = "inherit" onClick={() => {onClose(undefined, undefined, undefined)}}>{t("cancel")}</Button>
          <Button variant = "contained" color = "secondary" onClick={() => {

            setErr(undefined)

            if(from.current === undefined || to.current === undefined){
            
              setErr(`*${t('setvalue.label')}`)
              return
            }

            // validate 
            const froms = from.current!.split(":")
            const tos = to.current!.split(":")

            const _from = parseInt(froms[0] ?? '0')
            const _to =  parseInt(tos[0] ?? '0')


            const isUntilTomorrow =  _from > _to

            if(!coming.current && value === ServiceType.meetup){
              setErr(`*${ t('comingfrom.label') }`)
              return
            }

            // change time string to date 
            const today = new Date();

            const start = new Date(today.getFullYear(), 
            today.getMonth(), 
            today.getDate(), 
            parseInt(froms[0]), 
            parseInt(froms[1]), 
            today.getSeconds() , 
            today.getMilliseconds());

            let end = new Date(today.getFullYear(), 
            today.getMonth(), 
            today.getDate(), 
            parseInt(tos[0]), 
            parseInt(tos[1]), 
            today.getSeconds(), 
            today.getMilliseconds());

            if(isUntilTomorrow) end.setHours(end.getHours() + 24)
            

           onClose(start, end, bio, coming.current, value)


          }}>{t("submit.button")}</Button>
       
        </DialogActions>
      </Dialog>
  );
}