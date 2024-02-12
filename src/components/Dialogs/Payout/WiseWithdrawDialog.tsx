import React, { useState } from "react";
import { 
    Dialog, 
    DialogProps, 
    DialogContent,
    Button,
    Stepper,
    Step,
    StepLabel,
    Box,
    styled,
    Divider,
    Alert,
    Typography
} from "@mui/material";
// import Check from '@mui/icons-material/Check';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
// import { Check, CheckCircleOutline } from '@mui/icons-material';

import { useWindowSize } from "../../../hooks/useWindowSize";
import { Quotation } from "../../Coin/Wallet/WiseWithdraw/Quotation";
import { Recipient } from "../../Coin/Wallet/WiseWithdraw/Recipient";
import { Transfer } from "../../Coin/Wallet/WiseWithdraw/Transfer";
import CheckCircleOutlineIcon from "../../../icons/materialUiSvg/checkcircle";
import DoneIcon from "../../../icons/materialUiSvg/done";

interface Props extends DialogProps {
    penalty: number;
    income: number;
    referralCredits: number;
    isReferredUser: boolean;
    onClose: () => void;
}

const steps = ['Amount', 'Recipient', 'Review'];

const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 10,
      left: 'calc(-50% + 16px)',
      right: 'calc(50% + 16px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: '#784af4',
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: '#784af4',
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
      borderTopWidth: 3,
      borderRadius: 1,
    },
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
    ({ theme, ownerState }) => ({
      color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
      display: 'flex',
      height: 22,
      alignItems: 'center',
      ...(ownerState.active && {
        color: '#784af4',
      }),
      '& .QontoStepIcon-completedIcon': {
        color: '#784af4',
        zIndex: 1,
        fontSize: 18,
      },
      '& .QontoStepIcon-circle': {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
      },
    }),
);
  
function QontoStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;
  
    return (
      <QontoStepIconRoot ownerState={{ active }} className={className}>
        {completed ? (
            <div
            className="QontoStepIcon-completedIcon"
            >
                <DoneIcon  />
            </div>
          
        ) : (
          <div className="QontoStepIcon-circle" />
        )}
      </QontoStepIconRoot>
    );
}

function WiseWithdrawDialog({ penalty, income, referralCredits, isReferredUser, onClose, ...props }: Props) {
    const [size] = useWindowSize();
    const widthLimit = 420;

    const [step, setStep] = useState<number>(0);
    const [quoteId, setQuoteId] = useState<string | null>(null);
    const [recipientId, setRecipientId] = useState<number | null>(null);
    const [withdrawAmount, setWithdrawAmount] = useState<number | null>(null);
    const [targetCurrency, setTargetCurrency] = useState<string | null>(null);
    const [creditType, setCreditType] = useState<string | null>(null);
    const [error, setError] = useState<string>('');
    
    const onCloseHandle = () => {
        setStep(0);
        setQuoteId(null);
        setRecipientId(null);
        setTargetCurrency(null);
        setCreditType(null);
        setError('');
        onClose();
    }

    const onStepClick = (clickedStep: number) => {
        if (clickedStep < step && step !== 3) {
            setStep(clickedStep);
        }
    }  

    return (
        <Dialog
            fullWidth={size.width > widthLimit}
            fullScreen={size.width <= widthLimit}
            {...props}
        >
            <Button
                onClick={onCloseHandle}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="#000"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                >
                <path d="M18.75 5.25l-13.5 13.5M18.75 18.75L5.25 5.25" />
                </svg>
            </Button>
            <Box sx={{ width: '100%', mt: 4, mb: 3 }}>
                <Stepper activeStep={step} alternativeLabel connector={<QontoConnector />}>
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel 
                          StepIconComponent={QontoStepIcon} 
                          onClick={() => onStepClick(index)}
                          sx={index < step ? { cursor: 'pointer' } : {}}
                        >
                          {label}
                        </StepLabel>
                    </Step>
                ))}
                </Stepper>
            </Box>
            <Divider />
            {error && (<Alert severity="error">{error}</Alert>)}
            <DialogContent>
                {step === 0 && (
                    <Quotation
                        income={income}
                        referralCredits={referralCredits}
                        penalty={penalty}
                        isReferredUser={isReferredUser}
                        setStep={setStep}
                        setQuoteId={setQuoteId} 
                        setWithdrawAmount={setWithdrawAmount}
                        setTargetCurrency={setTargetCurrency}
                        setCreditType={setCreditType}
                        setError={setError}
                    />
                )}
                {step === 1 && (
                    <Recipient
                        quoteId={quoteId}
                        targetCurrency={targetCurrency}
                        setStep={setStep}
                        setError={setError}
                        setRecipientId={setRecipientId} 
                    />
                )}
                {step === 2 && (
                    <Transfer
                        quoteId={quoteId}
                        recipientId={recipientId}
                        penalty={penalty}
                        withdrawAmount={withdrawAmount}
                        creditType={creditType}
                        isReferredUser={isReferredUser}
                        setStep={setStep}
                        setError={setError}
                    />
                )}
                {step === 3 && (
                  <Box  sx={{ height: '450px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                    <Typography variant="h6" fontWeight={700} textAlign="center">
                      All done!
                    </Typography>
                    {/* <CheckCircleOutline sx={{ fontSize: 60, color: '#4caf50', my: 3 }} /> */}
                    <CheckCircleOutlineIcon />
                    <Typography variant="body1" textAlign="center">
                      Your withdrawal is being processed.
                    </Typography>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      sx={{ mt: 4 }}
                      onClick={onCloseHandle}>
                      Close
                    </Button>
                  </Box>
                )}
            </DialogContent>
        </Dialog>
    )
}

export { WiseWithdrawDialog };