import React, { useState, useEffect, SetStateAction, Dispatch } from "react";
import axios from "axios";
import { debounce } from "lodash";
import {
    Box,
    FormControl,
    CircularProgress,
    Typography,
    Divider,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    TextField,
    Button
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../../../../store/firebase";
import DefaultTooltip from '../../../Tooltip/DefaultTooltip';

interface Props {
    quoteId: string | null
    recipientId: number | null;
    penalty: number;
    withdrawAmount: number | null;
    creditType: string | null;
    isReferredUser: boolean;
    setError: Dispatch<SetStateAction<string>>;
    setStep: Dispatch<SetStateAction<number>>;
}

enum pageType {
    loading = 0,
    transferReview = 1
}

enum CreditType {
    income = "Income",
    referral = "Referral"
}

const backEndUrl = process.env.REACT_APP_API_URL;

function Transfer({ quoteId, recipientId, penalty, withdrawAmount, creditType, isReferredUser, setError, setStep}: Props) {
    // Platform transfer fees
    const commissionFee = isReferredUser ? 0.15 : 0.25;
    const withdrawalFee = 0.29; // TODO: Get this from Firebase

    const idempotencyKey = uuidv4();

    const [page, setPage] = useState<pageType>(pageType.loading);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [transferRequirements, setTransferRequirements] = useState<any>([]);
    const [formData, setFormData] = useState<any>({});
    const [quote, setQuote] = useState<any>({});
    const [paymentOption, setPaymentOption] = useState<any>({});
    const [recipient, setRecipient] = useState<any>({});
    const [attempSubmit, setAttemptSubmit] = useState<boolean>(false);
    const [transferFee, setTransferFee] = useState<number>(0);

    useEffect(() => {
        if (!quoteId || !withdrawAmount || !creditType) {
            setStep(0);
            return;
        }

        if (!recipientId) {
            setStep(1);
            return;
        }

        getTransferDetails();
        // eslint-disable-next-line
    }, [quoteId, withdrawAmount, recipientId])

    // Get quote and recipient details from Wise
    const getTransferDetails = async () => {
        try {
            const getQuoteUrl = `${backEndUrl}/v1/quotations/${quoteId}`;
            const getRecipientUrl = `${backEndUrl}/v1/recipients/${recipientId}`;
            const token = await auth.currentUser?.getIdToken();

            // Send both requests at the same time
            const response = await axios.all([
                axios.get(getQuoteUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
                axios.get(getRecipientUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            ]);

            const [quoteResponse, recipientResponse] = response;
            setQuote(quoteResponse?.data?.data);
            setRecipient(recipientResponse?.data?.data?.recipient);

            const payOut = quoteResponse?.data?.data?.payOut;
            const payIn = quoteResponse?.data?.data?.preferredPayIn;
            const payOption = quoteResponse?.data?.data?.paymentOptions?.find((option: any) => option.payOut === payOut && option.payIn === payIn);
            setPaymentOption(payOption);

            if (creditType === CreditType.referral) {
                const fee = withdrawalFee + payOption?.fee?.total || 0;

                if (fee > (Number(withdrawAmount) - penalty)) {
                    setError("Fees exceed withdrawal amount. Please withdraw a higher amount.");
                    setStep(0);
                } else {
                    setTransferFee(fee);
                }
            } else {
                setTransferFee((Number(withdrawAmount) - penalty) * commissionFee + withdrawalFee);
            }

            await getTransferRequirements(formData);

            setPage(pageType.transferReview);
        } catch (error: any) {
            setError("Unable to get transfer details. Please try again");
            setStep(0);
        }
    }

    // Get addition transfer requirements form
    const getTransferRequirements = async (newFormData: any) => {
        try {
            const url = `${backEndUrl}/v1/transfers/transfer-requirements`;
            const token = await auth.currentUser?.getIdToken();
            const response = await axios.post(url, {
                quoteUuid: quoteId,
                targetAccount: recipientId,
                customerTransactionId: idempotencyKey,
                details: newFormData
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const { data } = response.data;

            // Create new form data object with new attributes if any
            const addedFormData: any = { ...newFormData };
            data.transferRequirements.forEach((item: any) => {
                item.fields.forEach((field: any) => {
                    field.group.forEach((groupItem: any) => {
                        if (!addedFormData[groupItem.key]) {
                            addedFormData[groupItem.key] = "";
                        }
                    });
                });
            });
            setFormData(addedFormData);
            setTransferRequirements(data.transferRequirements);

            // Remove attributes that are no longer required
            const removedFormData: any = { ...addedFormData };
            Object.keys(removedFormData).forEach((key: string) => {
                if(!data.transferRequirements.find((item: any) => item.fields.find((field: any) => field.group.find((groupItem: any) => groupItem.key === key)))) {
                    delete removedFormData[key];
                }
            });
            setFormData(removedFormData);
        } catch (error: any) {
            setError("Unable to get transfer requirements. Please try again");
            setStep(1);
        }
    }

    // Handle form change
    const handleDynamicFormChange = (event: any, key: string, refreshRequirementsOnChange: boolean) => {
        const sanitizedValue = event.target.value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        const newFormData = { 
            ...formData,
            [key]: sanitizedValue
        };
        setFormData(newFormData);

        // Update transfer requirements if refereshRequirementsOnChange is true
        if (refreshRequirementsOnChange) {
            updateDynamicTransferRequirements(newFormData);
        }
    }

    // Get the updated dynamic transfer requirements for mfrom Wise based on the user input
    const updateDynamicTransferRequirements = (newFormData: any) => {
        setIsLoading(true);
        const debouncedApiCall = debounce(async() => {
            await getTransferRequirements(newFormData);
            setIsLoading(false);
        }, 1000);

        debouncedApiCall();
    }

    const handleConfirm = async() => {
        setAttemptSubmit(true);

        // Get required fields
        const requiredFields: any = [];
        transferRequirements.forEach((requirement: any) => {
            requirement.fields.forEach((field: any) => {
                field.group.forEach((item: any) => {
                    if (item.required) {
                        requiredFields.push(item.key);
                    }
                });
            });
        });

        // Check if all required fields are filled
        let isFormValid = true;
        requiredFields.forEach((key: string) => {
            if (!formData[key]) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            createTransfer();
        }
    }

    // Create transfer
    const createTransfer = async() => {
        try {
            setError("");
            setPage(pageType.loading);
            const url = `${backEndUrl}/v1/transfers/create-transfer`;
            const token = await auth.currentUser?.getIdToken();
            await axios.post(url, {
                withdrawalAmount: withdrawAmount,
                creditType: creditType,
                transfer: {
                    quoteUuid: quoteId,
                    targetAccount: recipientId,
                    customerTransactionId: idempotencyKey,
                    details: formData
                }
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStep(3);
        } catch (error: any) {
            const { data } = error.response;
            if (error.response.status === 400 || error.response.status === 422) {
                setError(data?.error?.message || "Transfer failed. Please try again");
            } else {
                setError("Transfer failed. Please try again");
            }
            setPage(pageType.transferReview);
            setStep(0);
        }
    }

    // Render the input field based on the field config
    const renderInput = (field: any) => {
        switch (field.type) {
            case "select":
                return (
                    <FormControl 
                        fullWidth 
                        key={field.key}  
                        sx={{ mt: 4 }}
                        error={(() => {
                            if (field.required && formData[field.key] === "" && attempSubmit) {
                                return true;
                            }

                            return false;
                        })()}
                    >
                        <InputLabel 
                            id={`${field.key}-label`} 
                            color="secondary"
                        >{`${field.name} ${!field.required ? "(optional)" : ""}`}</InputLabel>
                        <Select
                            label={`${field.name} ${!field.required ? "(optional)" : ""}`}
                            labelId={`${field.key}-label`}
                            id={field.key}
                            value={formData[field.key]}
                            onChange={(event) => handleDynamicFormChange(event, field.key, field.refreshRequirementsOnChange)}
                            autoComplete="off"
                            color="secondary"
                        >
                            {field.valuesAllowed.map((value: any) => (
                                <MenuItem key={value.key} value={value.key}>{value.name}</MenuItem>
                            ))}
                        </Select>
                        {field.required && formData[field.key] === "" && attempSubmit && (
                            <FormHelperText>This field is required</FormHelperText>
                        )}
                    </FormControl>
                )
            default:
                return (
                    <TextField 
                        sx={{ mt: 4 }}
                        fullWidth
                        key={field.key}
                        id={field.key}
                        label={`${field.name} ${!field.required ? "(optional)" : ""}`}
                        value={formData[field.key]}
                        onChange={(event) => handleDynamicFormChange(event, field.key, field.refreshRequirementsOnChange)}
                        autoComplete="off"
                        color="secondary"
                        error={(() => {
                            if (field.required && formData[field.key] === "" && attempSubmit) {
                                return true;
                            }

                            if (formData[field.key] && field.minLength && formData[field.key].length < field.minLength) {
                                return true;
                            }

                            if (formData[field.key] && field.maxLength && formData[field.key].length > field.maxLength) {
                                return true;
                            }

                            if (formData[field.key] && field.validationRegexp) {
                                const pattern = new RegExp(field.validationRegexp);
                                if (!pattern.test(formData[field.key])) {
                                    return true;
                                }
                            }

                            return false;
                        })()}
                        helperText={(() => {
                            if (field.required && formData[field.key] === ""  && attempSubmit) {
                                return "This field is required";
                            }

                            if (formData[field.key] && field.minLength && formData[field.key].length < field.minLength) {
                                return `This field must be at least ${field.minLength} characters long`;
                            }

                            if (formData[field.key] && field.maxLength && formData[field.key].length > field.maxLength) {
                                return `This field must be at most ${field.maxLength} characters long`;
                            }

                            if (formData[field.key] && field.validationRegexp) {
                                const pattern = new RegExp(field.validationRegexp);
                                if (!pattern.test(formData[field.key])) {
                                    return "Please enter a valid value";
                                }
                            }

                            return "";
                        })()}
                    />
                )
        }
    }

    return (
        <>
        {page === pageType.loading && (
            <Box  sx={{ height: '450px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress color="secondary" />
            </Box>
        )}
        {page === pageType.transferReview && (
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700} textAlign={"center"} gutterBottom>
                    Review details of your withdrawal
                </Typography>

                {/* Transfer details */}
                <Box sx={{ mt: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '5px' }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ mb: 2 }} fontWeight={600} gutterBottom>
                            Transfer details
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ color: '#454745', fontSize: '14px' }}>You withdraw</Typography>
                            <Typography sx={{ color: '#0e0f0c', fontSize: '20px', fontWeight: 600 }}>{(withdrawAmount ?? 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})} Credit</Typography>
                        </Box>
                        {penalty ? <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                            <Typography sx={{color: '#454745', fontSize: '14px'}}>Penalty</Typography>
                            <Typography sx={{
                                color: '#0e0f0c',
                                fontSize: '14px'
                            }}>{(penalty).toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2
                            }) ?? ''}</Typography>
                        </Box> : ''}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ color: '#454745', fontSize: '14px' }}>Fee {creditType !== CreditType.referral && isReferredUser && (
                                <DefaultTooltip
                                    width={16}
                                    margin='0 0 0 5px'
                                    title={<Typography variant='body2' whiteSpace="pre-line"
                                                       dangerouslySetInnerHTML={{ __html: `Referred users enjoy 10% discount on platform fee`}}
                                    ></Typography>}
                                    url="https://images.rentbabe.com/assets/mui/help.svg"
                                />
                            )}</Typography>
                            <Typography sx={{ color: '#0e0f0c', fontSize: '14px'}}>{(transferFee).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}) ?? ''}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ color: '#454745', fontSize: '14px' }}>Total amount we'll convert</Typography>
                            <Typography sx={{ color: '#0e0f0c', fontSize: '14px'}}>{((withdrawAmount ?? 0) - penalty - transferFee).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ color: '#454745', fontSize: '14px' }}>Rate</Typography>
                            <Typography sx={{ color: '#0e0f0c', fontSize: '14px'}}>{quote.rate.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: undefined})}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ color: '#454745', fontSize: '14px' }}>Recipient gets</Typography>
                            <Typography sx={{ color: '#0e0f0c', fontSize: '20px', fontWeight: 600 }}>{paymentOption?.targetAmount?.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})} {quote.targetCurrency}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ color: '#454745', fontSize: '14px' }}>Should arrive <strong>{paymentOption.formattedEstimatedDelivery}</strong></Typography>
                        </Box>
                    </Box>
                    <Divider />
                    <Box>
                        <Typography sx={{ mt: 3, mb: 2 }} fontWeight={600} gutterBottom>
                            Recipient details
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ color: '#454745', fontSize: '14px' }}>Name</Typography>
                            <Typography sx={{ color: '#0e0f0c', fontSize: '14px'}}>{recipient.name?.fullName ?? ''}</Typography>
                        </Box>
                        {recipient.displayFields?.map((field: any) => (
                            <Box key={field.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ color: '#454745', fontSize: '14px' }}>{field.label}</Typography>
                            <Typography sx={{ color: '#0e0f0c', fontSize: '14px'}}>{field.value}</Typography>
                        </Box>
                        ))}
                    </Box>
                </Box>

                {/* Transfer additional requirements */}
                {transferRequirements.length && (<Box sx={{}}>
                    {transferRequirements.map((requirement: any) => {
                        return requirement.fields.map((field: any) => {
                            return field.group.map((item: any) => renderInput(item))
                        });
                    })}
                </Box>)}

                {/* Confirm button */}
                <Button 
                    variant="contained"
                    color="success"
                    fullWidth
                    disabled={isLoading}
                    onClick={handleConfirm}
                    sx={{ mt: 4 }}
                >
                    Confirm and withdraw
                </Button>
            </Box>
        )}
        </>
    )
}

export { Transfer };