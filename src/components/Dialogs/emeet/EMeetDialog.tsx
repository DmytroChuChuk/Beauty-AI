import { 
    Button, 
    Checkbox, 
    Dialog, 
    DialogActions,
    DialogContent, 
    DialogTitle, 
    FormControl, 
    InputLabel, 
    LinearProgress, 
    ListItemText, 
    MenuItem, 
    Select, 
    SelectChangeEvent 
} from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { FC, useEffect, useState } from 'react';
import { USERS, app, emeets, pref } from '../../../keys/firestorekeys';
import { useUser } from '../../../store';
import shallow from 'zustand/shallow';
import { db } from '../../../store/firebase';
import { preferencesNames, applicationNames } from '../../../data/data';


interface props {
    open: boolean
    enableCancel?: boolean
    onClose?: () => void
}

const EMeetDialog : FC<props> = ({open, onClose, enableCancel = true}) => {

    
    const [ 
        uid, 
        emeetsPref, 
        emeetsApp 
    ] = useUser((state) => [
        state.currentUser?.uid,
        state.currentUser?.emeetsPref,
        state.currentUser?.emeetsApp
    ], shallow)


    // <MenuItem value={0}>WhatsApp</MenuItem>
    // <MenuItem value={1}>Telegram</MenuItem>
    // <MenuItem value={2}>Discord</MenuItem>
    // <MenuItem value={3}>Viber</MenuItem>
    // <MenuItem value={4}>Facebook Messenger</MenuItem>
    // <MenuItem value={5}>Line</MenuItem>
    // <MenuItem value={6}>KakaoTalk</MenuItem>
    // <MenuItem value={7}>WeChat</MenuItem>

    const [isLoading, setLoading] = useState<boolean>(false)
    const [application, setApplication] = useState<string[]>(emeetsApp ?? [])
    const [preferences, setPreferences] = useState<string[]>(emeetsPref ?? [])

    useEffect(() => {
        setApplication(emeetsApp ?? [])
        setPreferences(emeetsPref ?? [])
    }, [emeetsApp, emeetsPref])

    const handleApplicationChange = (event: SelectChangeEvent<typeof application>) => {
        const {
          target: { value },
        } = event;
        setApplication(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handlePreferenceChange = (event: SelectChangeEvent<typeof preferences>) => {
        const {
          target: { value },
        } = event;
        setPreferences(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
    };

    const onSubmit = async () => {

        if(!uid) return

        setLoading(true)

        await updateDoc(doc(db, USERS, uid), {
            [emeets]: {
                [pref]: preferences.map(v => v.toLowerCase()),
                [app]: application.map(v => v.toLowerCase())
            }
        })

        setLoading(false)
        onClose?.()
    }

    return <Dialog fullWidth open={open}>

        {isLoading && <LinearProgress color="secondary"/>}

        <DialogTitle>E-Meets preferences</DialogTitle>
        <DialogContent>
        <br/>
        <br/>
            <FormControl fullWidth>
                <InputLabel color="secondary" >Type of calls</InputLabel>
                <Select
                    color="secondary"
                    multiple
                    value={preferences}
                    label="Preferences"
                    renderValue={(selected) => selected.join(', ')}
                    onChange={handlePreferenceChange}
                >
                    {preferencesNames.map((name) => (
                        <MenuItem key={name} value={name}>
                        <Checkbox color='secondary'  checked={preferences.indexOf(name.toLowerCase()) > -1} />
                        <ListItemText primary={name} />
                        </MenuItem>
                    ))}
                </Select>

            </FormControl>

            <br/>
            <br/>

            <FormControl fullWidth>

            <InputLabel color="secondary">Application</InputLabel>
                <Select
                    color="secondary"
                    multiple
                    value={application}
                    label="Application"
                    renderValue={(selected) => selected.join(', ')}
                    onChange={handleApplicationChange}>

                    {applicationNames.map((name) => (
                        <MenuItem key={name} value={name}>
                        <Checkbox color='secondary' checked={application.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                        </MenuItem>
                    ))}
                </Select>

            </FormControl>

        </DialogContent>

        <DialogActions>
            {enableCancel && <Button color="secondary" onClick={onClose}>Cancel</Button>}
            <Button 
                disabled={application.length === 0 || preferences.length === 0} 
                color="secondary" onClick={onSubmit}>Submit</Button>
        </DialogActions>
    </Dialog>
 
}

export default EMeetDialog