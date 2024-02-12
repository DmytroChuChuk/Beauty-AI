import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import axios from "axios";
import { debounce } from "lodash";
import { 
    Box, 
    FormControl, 
    FormControlLabel,
    Checkbox,
    InputLabel, 
    Typography, 
    Select, 
    MenuItem, 
    TextField,
    Tabs, 
    Tab,
    Button,
    FormHelperText,
    CircularProgress,
    Card,
    Avatar
} from "@mui/material";
import { auth } from "../../../../store/firebase";

interface Props {
    quoteId: string | null,
    targetCurrency: string | null,
    setStep: Dispatch<SetStateAction<number>>;
    setError: Dispatch<SetStateAction<string>>
    setRecipientId: Dispatch<SetStateAction<number | null>>;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

enum PageType {
    loading= 0,
    selectRecipient = 1,
    createRecipient = 2,
}

function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
}

const backEndUrl = process.env.REACT_APP_API_URL;

function Recipient({ quoteId, targetCurrency, setStep, setError, setRecipientId }: Props) {
    const [accountRequirements, setAccountRequirements] = useState<any>();
    const [formData, setFormData] = useState<any>({});
    const [recipient, setRecipient] = useState<any>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [page, setPage] = useState<PageType>(PageType.loading);
    const [attempSubmit, setAttemptSubmit] = useState<boolean>(false); // For form validation
    const [tab, setTab] = useState<number>(0);
    const [termsAccepted, setTermsAccepted] = useState<boolean>(false); // For terms and conditions checkbox

    const [emailConfig, setEmailConfig] = useState<any>({})
    const [accountHolderNameConfig, setAccountHolderNameConfig] = useState<any>({});

    // Clear recipient id if it already exists
    useEffect(() => {
        setRecipientId(null);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!quoteId || !targetCurrency) {
            setStep(0);
            return;
        }

        searchRecipient();
        // eslint-disable-next-line
    }, [quoteId, targetCurrency]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    }

    // Search for recipient based on the target currency
    const searchRecipient = async() => {
        try {
            setIsLoading(true);
            const url = `${backEndUrl}/v1/recipients/user`;
            const token = await auth.currentUser?.getIdToken();
            const response = await axios.post(url, {
                currency: targetCurrency
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const { data } = response.data;
            
            if (data.recipients.length) {
                getRecipientDetailsById(data.recipients[0].recipientId);
            } else {
                getDynamicAccountForm();
            }
        } catch (error: any) {
            setError("There was an error while searching for recipient. Please try again");
            setIsLoading(false);
            setStep(0);
        }
    }

    // Fetch the recipient details from Wise
    const getRecipientDetailsById = async(id: string) => {
        try {
            const url = `${backEndUrl}/v1/recipients/${id}`;
            const token = await auth.currentUser?.getIdToken();
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const { data } = response.data;

            setRecipient(data.recipient);
            setPage(PageType.selectRecipient);
            setIsLoading(false);
        } catch (error: any) {
            setError("There was an error retrieving recipient details. Please try again");
            setIsLoading(false);
            setStep(0);
        }
    }

    // Update quote with selected recipient id
    const updateQuoteWithRecipient = async(id: number) => {
        setAttemptSubmit(true);
        if (!termsAccepted) {
            return;
        }

        try {
            setError("");
            setPage(PageType.loading);
            const url = `${backEndUrl}/v1/quotations/${quoteId}`;
            const token = await auth.currentUser?.getIdToken();
            await axios.patch(url, {
                targetAccount: id
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setRecipientId(id);
            setStep(2);
        } catch (error: any) {
            setError("There was an error setting the recipient. Please try again");
            setPage(PageType.selectRecipient);
        }
    }

    const handleEditRecipient = async(id: number) => {
        try {
            setIsLoading(true);
            setPage(PageType.loading);
            const url = `${backEndUrl}/v1/recipients/delete`;
            const token = await auth.currentUser?.getIdToken();
            await axios.post(url, {
                recipientId: id
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setRecipient({});
            getDynamicAccountForm();
        } catch (error: any) {
            setError("There was an error. Please try again")
            setIsLoading(false);
            setStep(0);
        }
    }

    // Get the dynamic account form to create a new recipient
    const getDynamicAccountForm = async() => {
        try {
            const url = `${backEndUrl}/v1/recipients/account-requirements/${quoteId}`;
            const token = await auth.currentUser?.getIdToken();
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const { data } = response.data;
            
            // Create form data object
            const formDataObject: any = {};
            data.accountRequirements.forEach((item: any) => {
                item.fields.forEach((field: any) => {
                    field.group.forEach((groupItem: any) => {
                        formDataObject[groupItem.key] = "";
                    });
                });
            });
            setFormData(formDataObject);
            setAccountRequirements(data.accountRequirements);
            setPage(PageType.createRecipient);
            setIsLoading(false);
        } catch (error: any) {
            setError("There was an error while retrieving the recipient form. Please try again");
            setIsLoading(false);
            setStep(0);
        }
    }

    // Create payload based on the type and latest data passed as parameter
    const createRecipientPayload = (data: any, type: string) => {

        // Get list of keys required for the specific type
        const keysForType: string[] = [];
        accountRequirements?.find((item: any) => item.type === type)?.fields?.forEach((field: any) => {
            field.group.forEach((groupItem: any) => {
                keysForType.push(groupItem.key);
            });
        });

        const payload: any = {
            currency: targetCurrency,
            type,
            details: {}
        }

        //Add accountHolderName key if accountHolderNameConfig is not empty
        if (accountHolderNameConfig?.key) {
            keysForType.push(accountHolderNameConfig.key);
        }
        //Add email key if emailConfig is not empty
        if (emailConfig?.key) {
            keysForType.push(emailConfig.key);
        }
        
        keysForType.forEach((key: string) => {
            if (data[key] === "") {
                return;
            }
            
            if (key === "accountHolderName" || key === "language") {
                payload[key] = data[key];
            } else if (key.includes('.')) {
                const keySplit = key.split('.');
                if (!payload.details[keySplit[0]]) {
                    payload.details[keySplit[0]] = {};
                }
                payload.details[keySplit[0]][keySplit[1]] = data[key];
            } else {
                payload.details[key] = data[key];
            }
        });

        return payload;
    }

    // Handle create recipient form changes
    const handleDynamicFormChange = (event: any, id: string, refreshRequirementsOnChange: false, type: string) => {;
        const sanitizedValue = event.target.value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        const newFormData = {
            ...formData,
            [id]: sanitizedValue
        };
        setFormData(newFormData);

        // Update the dynamic account form if refreshRequirementsOnChange is true
        if (refreshRequirementsOnChange) {
            const payload = createRecipientPayload(newFormData, type);
            updateDynamicAccountForm(payload, newFormData);
        }
    }

    // Get the updated dynamic account form from Wise based on the user input
    const updateDynamicAccountForm = (payload: any, newFormData: any) => {
        setIsLoading(true);
        const debouncedApiCall = debounce(async () => {
            try {
                const url = `${backEndUrl}/v1/recipients/account-requirements/${quoteId}`;
                const token = await auth.currentUser?.getIdToken();
                const response = await axios.post(url, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const { data } = response.data;
                
                // Create new form data object with new attributes if any
                const addedFormData: any = { ...newFormData };
                data.accountRequirements.forEach((item: any) => {
                    item.fields.forEach((field: any) => {
                        field.group.forEach((groupItem: any) => {
                            if (!addedFormData[groupItem.key]) {
                                addedFormData[groupItem.key] = "";
                            }
                        });
                    });
                });
                setFormData(addedFormData);
                setAccountRequirements(data.accountRequirements);

                //Remove attributes that are no longer required
                const removedFormData: any = { ...addedFormData };
                Object.keys(removedFormData).forEach((key: string) => {
                    if (!data.accountRequirements.find((item: any) => item.fields.find((field: any) => field.group.find((groupItem: any) => groupItem.key === key)))) {
                        // Preserve email and accountHolderName
                        if (key !== emailConfig.key && key !== accountHolderNameConfig.key) {
                            delete removedFormData[key];
                        }
                    }
                });
                setFormData(removedFormData);
                setIsLoading(false);
            } catch (error: any) {
                setError("There was an error while retrieving the recipient form. Please try again");
                setIsLoading(false);
                setStep(0);
            }
        }, 1000);

        debouncedApiCall();
    }

    // Handle confirm for create new recipient
    const handleConfirm = async(type: string) => {
        setAttemptSubmit(true);

        if (!termsAccepted) {
            return;
        }

        // get required fields for the selected type
        const requiredFields: any = [];
        accountRequirements?.find((item: any) => item.type === type)?.fields?.forEach((field: any) => {
            field.group.forEach((groupItem: any) => {
                if (groupItem.required) {
                    requiredFields.push(groupItem.key);
                }
            });
        });

        if(emailConfig?.required) {
            requiredFields.push(emailConfig.key);
        }

        if(accountHolderNameConfig?.required) {
            requiredFields.push(accountHolderNameConfig.key);
        }

        // Check if all required fields are filled
        let isRequiredFieldsFilled = true;
        requiredFields.forEach((field: string) => {
            if (formData[field] === "") {
                isRequiredFieldsFilled = false;
            }
        });

        if (isRequiredFieldsFilled) {
            const payload = createRecipientPayload(formData, type);
            createRecipient(payload);
        }
    }

    // Call BE to create a new recipient
    const createRecipient = async(payload: any) => {
        try {
            setError("");
            setIsLoading(true);
            const url = `${backEndUrl}/v1/recipients/new`;
            const token = await auth.currentUser?.getIdToken();
            const response = await axios.post(url, {
                recipientDetails: payload
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const { data } = response.data;
            updateQuoteWithRecipient(data.recipient.id);
        } catch (error: any) {
            const { data } = error.response;
            if (error.response.status === 400 || error.response.status === 422) {
                setError(data?.error?.message || "Recipient creation failed. Please try again");
            } else {
                setError("Recipient creation failed. Please try again")
            }
            setIsLoading(false);
        }
    }

    // Render the input field based on the field config and type
    const renderInput = (field: any, type: string) => {
        // Check if field is email and store config
        if (field.key === 'email' && type !== 'userDetails') {
            if (!Object.keys(emailConfig).length) {
                setEmailConfig({ ...field });
            }
            return;
        }

        // Check if field is accountHolderName and store config
        if (field.key === 'accountHolderName' && type !== 'userDetails') {
            if (!Object.keys(accountHolderNameConfig).length) {
                setAccountHolderNameConfig({ ...field });
            }
            return;
        }

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
                        >{field.name}</InputLabel>
                        <Select
                            label={field.name}
                            labelId={`${field.key}-label`}
                            id={field.key}
                            value={formData[field.key]}
                            onChange={(event) => handleDynamicFormChange(event, field.key, field.refreshRequirementsOnChange, type)}
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
                        label={field.name}
                        value={formData[field.key]}
                        onChange={(event) => handleDynamicFormChange(event, field.key, field.refreshRequirementsOnChange, type)}
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
        {page === PageType.loading && (
            <Box  sx={{ height: '450px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress color="secondary" />
            </Box>
        )}
        {page === PageType.selectRecipient && (
            <Box  sx={{ height: '450px', p: 2 }}>
                <Typography variant="h6" fontWeight={700} textAlign={"center"} gutterBottom>
                    Select recipient
                </Typography>
                {recipient.id && (
                    <>
                        <FormControlLabel control={<Checkbox color="secondary" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />} label=" I accept that the platform will not be liable for transactions made to incorrect accounts due to incorrect information provided by me, and such transactions are not retrievable."
                        sx={[!termsAccepted && attempSubmit && { color: 'red' }, { mt: 2 }]} />
                        <Card 
                            sx={[
                                termsAccepted && { '&:hover': { backgroundColor: '#16330014', cursor: 'pointer' }},
                                !termsAccepted && { backgroundColor: '#F5F5F5', cursor: 'not-allowed' },
                                { p: 2, display: 'flex', mt: 3 }
                            ]} 
                            variant="outlined"
                            onClick={() => updateQuoteWithRecipient(recipient.id)}
                        >
                            <Avatar sx={[{ backgroundColor: '#16330014', color: '#0e0f0c', fontSize: '16px', fontWeight: '600', height: '48px', width: '48px', overflow: 'visible', mr: '16px' }, !termsAccepted && {  color: '#A9A9A9' }]}>
                                {
                                `${recipient.name?.fullName?.split(" ")[0][0] ?? ''}${recipient.name?.fullName?.split(" ")[1][0] ?? ''}`
                                }
                                <img
                                        loading="lazy"
                                        width="20"
                                        height="20"
                                        src={`https://flagcdn.com/w20/${recipient.country.toLowerCase()}.png`}
                                        srcSet={`https://flagcdn.com/w40/${recipient.country.toLowerCase()}.png 2x`}
                                        alt=""
                                        style={{ border: '2px solid #ffeeeeee', borderRadius: '50%', position: 'absolute', bottom: '-3px', right: '-3px' }}
                                    />
                            </Avatar>
                            <Box>
                                <Typography sx={[{ fontWeight: 600, color: '#0e0f0c' }, !termsAccepted && {  color: '#A9A9A9' }]}>{recipient.name?.fullName}</Typography>
                                <Typography sx={[{ color: '#454745', fontSize: '14px' }, !termsAccepted && {  color: '#A9A9A9' }]}>{recipient.longAccountSummary}</Typography>
                            </Box>
                        </Card>
                        <Button 
                            variant="outlined" 
                            color="secondary"
                            fullWidth
                            disabled={isLoading}
                            onClick={() => handleEditRecipient(recipient.id)}
                            sx={{ mt: 4 }}
                        >
                            Edit recipient
                        </Button>
                    </>                    
                )}
            </Box>
        )}
        {page === PageType.createRecipient && (
            <Box  sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700} textAlign={"center"} gutterBottom>
                    Enter account details
                </Typography>
                <Box sx={{ width: '100%', mt: 3 }}>
                    {accountHolderNameConfig?.key && (renderInput(accountHolderNameConfig, 'userDetails'))}
                    {emailConfig?.key && (renderInput(emailConfig, 'userDetails'))}
                </Box>
                <Box sx={{ width: '100%', mt: 3 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs 
                            value={tab} 
                            textColor="secondary"
                            indicatorColor="secondary" 
                            onChange={handleTabChange} 
                        >
                            {accountRequirements?.filter((forms: any) => forms.type !== 'email').map((item: any) => (
                                <Tab key={item.type} label={item.title} {...a11yProps(0)} />
                            ))}
                        </Tabs>
                    </Box>
                    {accountRequirements?.filter((forms: any) => forms.type !== 'email').map((item: any, index: number) => (
                        <CustomTabPanel key={index} value={tab} index={index}>
                            {item.fields.map((field: any) => (
                                <Box key={field.name}>
                                    {field.group.map((groupItem: any) => renderInput(groupItem, item.type))}
                                </Box>
                            ))}
                            <FormControlLabel control={<Checkbox color="secondary" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />} label=" I accept that the platform will not be liable for transactions made to incorrect accounts due to incorrect information provided by me, and such transactions are not retrievable."
                        sx={[!termsAccepted && attempSubmit && { color: 'red' }, { mt: 2 }]} />
                            <Button 
                                variant="contained" 
                                color="success"
                                fullWidth
                                disabled={isLoading || !termsAccepted}
                                onClick={() => handleConfirm(item.type)}
                                sx={{ mt: 4 }}
                            >
                                Confirm
                            </Button>
                        </CustomTabPanel>
                    ))}
                </Box>
            </Box>
        )}
        </>
    );
}

export { Recipient };