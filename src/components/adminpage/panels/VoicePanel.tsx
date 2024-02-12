import { Accordion, Typography, AccordionDetails } from '@mui/material';
import { FC } from 'react';
import AccordionIcon from '../components/AccordionIcon';
import AdminRecoder from '../components/AdminRecorder';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import history from '../../../utility/history';
import { useTranslation } from 'react-i18next';
import { RecorderProps } from '../../audio/src/Pages/Recorder';


interface props {
    voiceUrl : string | undefined
    expanded : boolean
    hideRule? : boolean
    onChange?: (event: React.SyntheticEvent, expanded: boolean) => void
    onVoiceHandle: (data: RecorderProps | null) => void
}

const VoicePanel : FC<props> = ({voiceUrl, expanded, onChange, onVoiceHandle, hideRule = false}) => {

    const [ t ] = useTranslation()

    return <Accordion sx={{width: "100%"}}  expanded={expanded} onChange={onChange}>
    <AdminAccordionSummary >
        <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_voice.svg"/>
        
        <Typography marginLeft={3} className="secondaryHeading">{t("voice.recording")}</Typography>
       

        {!hideRule && <Typography onClick={() => {
                history.push("/voicerule")
        }} variant='body2' sx={{textDecoration: "underline", color: "red!important"}} marginLeft={1}>Rules</Typography>}

    </AdminAccordionSummary>

    <AccordionDetails>
        <AdminRecoder 
            voiceUrl={voiceUrl} 
            handleAudioStop = {onVoiceHandle}
            // handleAudioPause = {onVoiceHandle}
            // handleAudioUpload = {onVoiceHandle}
            handleReset = {() => {
                onVoiceHandle(null)
            }}
        />
    </AccordionDetails>
</Accordion>
 
}

export default VoicePanel