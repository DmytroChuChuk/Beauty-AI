import { TextField } from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import { useEffect , FC, useState} from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles'
import type {} from '@mui/x-date-pickers/themeAugmentation';
import dayjs, { Dayjs } from 'dayjs';
import locale from 'date-fns/locale/en-GB'
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from 'react-i18next';

interface props {
    DOB: Timestamp | undefined
    onChange: (date : Date | undefined) => void
}

const DateOfBirth : FC<props> = ({DOB : _DOB,  onChange}) => {

    const [ t ] = useTranslation()

    const theme = createTheme({
        palette: {
          primary: {
            main: "#2196f3",
            contrastText: "#fff" //button text white instead of black
          }
        }
      });

    const [DOB , setDOB] = useState<Date | undefined>(_DOB?.toDate())

    useEffect(() => {
        setDOB(_DOB?.toDate())
    } , [_DOB])

    const handleDateChange = (newValue: Dayjs | null) => {
        
        const dateValue = dayjs(newValue).toDate() 
        setDOB(dateValue)

        if(dateValue) onChange(dateValue)
    }


    return <ThemeProvider theme={theme}>
        <LocalizationProvider 
        locale={locale} 
        dateAdapter={DateFnsUtils}>
        <MobileDatePicker
            label={t("dob.label")}
            inputFormat="dd MMM yyyy"
            value={dayjs(DOB)}
            onChange={handleDateChange}
            renderInput={(params) => <TextField 
                size="small" 
                sx={{width: "100%"}} 
                {...params} 
            />}
        />
        </LocalizationProvider>
    </ThemeProvider>
 
}

export default (DateOfBirth);