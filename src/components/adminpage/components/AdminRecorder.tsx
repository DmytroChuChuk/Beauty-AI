import React from 'react';
import MyRecorder, { RecorderProps } from '../../audio/src/Pages/Recorder';


interface props {
    voiceUrl: string | undefined
    // voiceDetails: any
    handleAudioStop: (data: RecorderProps) => void
    handleReset: () => void
    // handleAudioUpload: (data: any) => void
    // handleAudioPause: (data: any) => void
}

const AdminRecoder : React.FC <props> = ({
    voiceUrl, 
    // voiceDetails, 
    handleAudioStop, 
    handleReset}) => {

        return <>
            <MyRecorder
                voiceUrl={voiceUrl}
                onRecordReset={handleReset}
                onRecordStopHandle={handleAudioStop}
            />
        </>

        // return <>
        //     <div style={{width: "100%"}} >
        //         <Recorder
        //             openDialog={openDialog}
        //             audioURL={voiceDetails?.url ?? voiceUrl}
        //             showUIAudio={voiceDetails?.url ?? voiceUrl}
        //             handleAudioPause={(data:any) => {   
        //                 handleAudioPause(data)
        //             }}
        //             handleAudioStop={(data:any) => {   
                        
        //                 handleAudioStop(data)
        //             }}
        //             handleAudioUpload={(data:any) => handleAudioUpload(data)}
        //             handleReset={() => {
        //                 const data = {
        //                     url: null,
        //                     blob: null,
        //                     chunks: null,
        //                     duration: {
        //                     h: 0,
        //                     m: 0,
        //                     s: 0
        //                     }
        //                 };

        //                 handleReset(data)
        //             }}
        //         />
        //         <br/>
        //     </div>

        //     <Dialog open={open} onClose={onClose}>
        //         {isLoading && <LinearProgress color="secondary"/>}
        //         <DialogTitle>Delete voice recording</DialogTitle>

        //         <DialogContent>
        //             <DialogContentText>
        //                 Are you sure you want to delete voice recording?
        //             </DialogContentText>
        //         </DialogContent>

        //         <DialogActions>
        //             <Button color="warning" onClick={onClose}>
        //                 Cancel
        //             </Button>
        //             <Button color='warning' onClick={onDelete}>
        //                 Delete
        //             </Button>
        //         </DialogActions>
        //     </Dialog>
            
        // </>
}

export default AdminRecoder;