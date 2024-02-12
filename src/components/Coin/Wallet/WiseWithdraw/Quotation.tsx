import React, { useState, useEffect, forwardRef, Dispatch, SetStateAction } from "react";
import {
    Box,
    Button,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Skeleton,
    CircularProgress,
    FormLabel, Radio, RadioGroup, FormControlLabel
} from "@mui/material";
import NumberFormat, { InputAttributes } from "react-number-format";
import axios from "axios";
import { debounce } from "lodash";
import { auth } from "../../../../store/firebase";
import DefaultTooltip from "../../../Tooltip/DefaultTooltip";
import { useTranslation } from "react-i18next";

interface Props {
    penalty: number;
    income: number;
    referralCredits: number;
    isReferredUser: boolean;
    setStep: Dispatch<SetStateAction<number>>;
    setQuoteId: Dispatch<SetStateAction<string | null>>;
    setWithdrawAmount: Dispatch<SetStateAction<number | null>>;
    setTargetCurrency: Dispatch<SetStateAction<string | null>>;
    setCreditType: Dispatch<SetStateAction<string | null>>;
    setError: Dispatch<SetStateAction<string>>
}

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

interface Quote {
    id: string;
    rate: number;
    totalFee: number;
    amountConverted: number;
    targetAmount: number;
    targetCurrency: string;
    formattedEstimatedDelivery: string;
}

enum PageType {
    loading= 0,
    createQuotation = 1,
}

enum CreditType {
    income = "Income",
    referral = "Referral"
}

const NumberFormatCustom = forwardRef<
  NumberFormat<InputAttributes>,
  CustomProps
>((props, ref) => {
  const { onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      isNumericString
    />
  );
});

const CalIconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    width: '16px',
    height: '16px',
    backgroundColor: '#16330014',
    borderRadius: '50%',
    lineHeight: '16px',
    marginRight: '10px'
}

const backEndUrl = process.env.REACT_APP_API_URL;

const currencyLocalStorageKey = "wise-withdraw-currency";

function Quotation(props: Props) {

    const { t } = useTranslation()
    // Platform transfer fees
    const commissionFee = props.isReferredUser ? 0.15 : 0.25;
    const withdrawalFee = 0.29; // TODO: Get this from Firebase

    // WISE currency code and ISO 3166 country code to get the flag
    const currecyCountryList = [
        {
            currency: "SGD",
            countryCode: "SG",
            countryName: "Singapore"
        },
        {
            currency: "MYR",
            countryCode: "MY",
            countryName: "Malaysia"
        },
        {
            currency: "IDR",
            countryCode: "ID",
            countryName: "Indonesia"
        },
        {
            currency: "THB",
            countryCode: "TH",
            countryName: "Thailand"
        },
        {
            currency: "VND",
            countryCode: "VN",
            countryName: "Vietnam"
        },
        {
            currency: "PHP",
            countryCode: "PH",
            countryName: "Philippines"
        },
        {
            currency: "INR",
            countryCode: "IN",
            countryName: "India"
        },
        {
            currency: "GBP",
            countryCode: "GB",
            countryName: "United Kingdom"
        },
        {
            currency: "USD",
            countryCode: "US",
            countryName: "United States of America"
        },
        {
            currency: "COP",
            countryCode: "CO",
            countryName: "Colombia"
        },
    ];

    const creditTypeList = [CreditType.income, CreditType.referral]

    const [creditType, setCreditType] = useState<string>(CreditType.income);
    const [currency, setCurrency] = useState<string>("SGD");
    const [amount, setAmount] = useState<number | string>('');
    const [conversionRate, setConversionRate] = useState<number>(0);
    const [transferFee, setTransferFee] = useState<number>(0);
    const [amountError, setAmountError] = useState<boolean>(false);
    const [amountErrorMessage, setAmountErrorMessage] = useState<string>("");
    const [quotation, setQuotation] = useState<Quote>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [page, setPage] = useState<PageType>(PageType.createQuotation);

    //Clear quotation id if it already exists
    useEffect(() => {
        props.setQuoteId(null);
        props.setTargetCurrency(null);
        props.setWithdrawAmount(null);
        props.setCreditType(null);

        // Get currency from local storage
        const currencyFromLocalStorage = localStorage.getItem(currencyLocalStorageKey);
        if (currencyFromLocalStorage) {
            setCurrency(currencyFromLocalStorage);
        }
        // eslint-disable-next-line
    }, []);

    // Make API call to get the quotation when input values change
    useEffect(() => {
        const debouncedApiCall = debounce(async () => {
            try {
                props.setError('');
                setConversionRate(0);
                const url = `${backEndUrl}/v1/quotations/new`;
                const token = await auth.currentUser?.getIdToken();

                const response = await axios.post(url, {
                    amount: creditType === CreditType.referral ? Number(amount) - props.penalty - withdrawalFee : Number(amount),
                    targetCurrency: currency,
                    isTargetAmount: false,
                    withdrawalAmount: amount,
                    creditType: creditType
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const { data } = response.data;
                const quoteObject: Quote = {
                    id: data.id,
                    rate: data.rate,
                    totalFee: data.paymentOptions[0]?.fee?.total ?? 0,
                    amountConverted: data.sourceAmount - data.paymentOptions[0]?.fee?.total ?? 0,
                    targetAmount: data.paymentOptions[0]?.targetAmount ?? 0,
                    targetCurrency: data.targetCurrency,
                    formattedEstimatedDelivery: data.paymentOptions[0]?.formattedEstimatedDelivery ?? ''
                };
                setQuotation(quoteObject);
                setConversionRate(quoteObject.rate);
                getFee(quoteObject.totalFee);
                setIsLoading(false);
            } catch (error: any) {
                props.setError('Error creating quotation. Please try again');
                setQuotation(undefined);
                setIsLoading(false);
            }
        }, 1000);

        // TODO: HOT FIX
        // if(amount && Number(amount) < props.penalty + 1) {
        //     setAmountError(true);
        //     setAmountErrorMessage(`Minimum withdrawal amount not met`);
        //     setQuotation(undefined);
        //     return;
        // }

        // Check if amount is a string and can be converted to a number
        if (typeof amount === 'string' && !isNaN(Number(amount))) {
            const numericAmount = Number(amount);
            if (numericAmount < props.penalty + 1) {
                setAmountError(true);
                setAmountErrorMessage(`Minimum withdrawal amount not met`);
                setQuotation(undefined);
                return;
            }
        } else if (typeof amount === 'number') {
            if (amount < props.penalty + 1) {
                setAmountError(true);
                setAmountErrorMessage(`Minimum withdrawal amount not met`);
                setQuotation(undefined);
                return;
            }
        }

        if(amount && currency && !amountError) {
            setIsLoading(true);
            debouncedApiCall();
        }


        return debouncedApiCall.cancel;
        // eslint-disable-next-line
    }, [amount, currency, creditType]);

    const isBalanceSufficient = (creditAmount: number, creditType: string) => {
        if ((creditType === CreditType.income && creditAmount > props.income) || (creditType === CreditType.referral && creditAmount > props.referralCredits )) {
            setAmountError(true);
            setAmountErrorMessage("Your balance is not sufficient");
            setQuotation(undefined);
            return false;
        } else {
            setAmountError(false);
            setAmountErrorMessage("");
            return true;
        }
    }

    const handleCreditTypeChange = (event: any) => {
        const value = event.target.value;

        if (amount) {
            isBalanceSufficient(Number(amount), value);
        }

        setCreditType(event.target.value);
    }

    const handleAmountChange = (event: any) => {
        const sanitizedValue = event.target.value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        props.setError('');
        if (!sanitizedValue || Number(sanitizedValue) === 0) {
            setAmountError(true);
            setAmountErrorMessage("Please enter Credit amount to withdraw");
            setAmount('');
            setQuotation(undefined);
            return;
        }

        // Validate regex for amount with 2 decimal places
        const regex = /^\d+(\.\d{1,2})?$/;
        if (!regex.test(sanitizedValue)) {
            return;
        }

        // Show error if amount is more than balance
        if (!isBalanceSufficient(Number(sanitizedValue), creditType)){
            setAmount(sanitizedValue);
            return;
        }

        setAmountError(false);
        setAmountErrorMessage("");
        setAmount(sanitizedValue);
    }

    const handleCurrencyChange = (event: any) => {
        const sanitizedValue = event.target.value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        props.setError('');
        setCurrency(sanitizedValue);

        // Store in local storage
        localStorage.setItem(currencyLocalStorageKey, sanitizedValue);
    }

    const handleContinue = async () => {
        try {
            setPage(PageType.loading);
            const url = `${backEndUrl}/v1/quotations/new`;
            const token = await auth.currentUser?.getIdToken();
            const targetAmount = creditType === CreditType.referral ? Number(amount) - props.penalty - withdrawalFee : (Number(amount) - props.penalty - transferFee) * conversionRate;
            const response = await axios.post(url, {
                amount: targetAmount,
                targetCurrency: currency,
                isTargetAmount: creditType !== CreditType.referral,
                withdrawalAmount: Number(amount),
                creditType: creditType
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const { data } = response.data;

            // Prevent proceeding if Wise fee is more than the platform commission
            if ((data.paymentOptions[0]?.fee?.total ?? 0) > transferFee) {
                props.setError('Cannot proceed with the entered withdrawal amount. Please enter a higher amount.');
                setPage(PageType.createQuotation);
                return;
            }

            props.setQuoteId(data.id);
            props.setTargetCurrency(data.targetCurrency);
            props.setWithdrawAmount(Number(amount));
            props.setCreditType(creditType);
            props.setStep(1);
                
        } catch (error: any) {
            props.setError('Error creating quotation. Please try again');
            setPage(PageType.createQuotation);
        }
    }

    const getCalculationRow = (symbol: string, title: string, value: number | string, hint?: string | TrustedHTML) => {
        return (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <span style={CalIconStyle}><span style={{ paddingBottom: '2px'}}>{symbol}</span></span> <strong>{isLoading ? <Skeleton width="50px" /> : quotation?.id ? value : ''}</strong>
                </Box>
                <Typography variant="subtitle1">{title}{hint && (
                    <DefaultTooltip
                        width={16}
                        margin='0 0 0 5px'
                        title={<Typography variant='body2' whiteSpace="pre-line"
                                           dangerouslySetInnerHTML={{ __html: `${hint}`}}
                        ></Typography>}
                        url="https://images.rentbabe.com/assets/mui/help.svg"
                    />
                )}</Typography>
            </Box>
        );
    }

    const getFee = (wiseFee: number) => {
        if (creditType === CreditType.referral) {
            const fee = withdrawalFee + wiseFee

            if (fee > Number(amount) - props.penalty) {
                props.setError('Cannot proceed with the entered withdrawal amount. Please enter a higher amount.');
                setQuotation(undefined);
            } else {
                setTransferFee(fee);
            }
        } else {
            setTransferFee((Number(amount) - props.penalty) * commissionFee + withdrawalFee);
        }
    }

    return (
        <>
        {page === PageType.loading && (
            <Box  sx={{ height: '450px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress color="secondary" />
            </Box>
        )}
        {page === PageType.createQuotation && (
            <Box sx={{
                p: 3
            }}>
               <FormControl sx={{ mt: 2, mb: 1 }}>
                   <FormLabel id={'credit-type-label'} color="secondary">Credit Type</FormLabel>
                   <RadioGroup
                       aria-label="credit-type"
                       name="credit-type"
                       value={creditType}
                       onChange={handleCreditTypeChange}
                       row>
                          {creditTypeList.map((item) => {
                            return (
                                <FormControlLabel key={item} value={item} control={<Radio color="secondary" />} label={item} />
                            );
                          })}
                   </RadioGroup>
               </FormControl>
            
                <Box>
                { creditType === CreditType.income ? <Typography  variant="caption" color="error">Platform & Withdrawal fees <DefaultTooltip
                        width={16}
                        margin='0 0 0 0px'
                        title={<Typography variant='body2' whiteSpace="pre-line"
                        dangerouslySetInnerHTML={{ __html: `${t("withdraw.hint")}`}}
                        ></Typography>}
                        url="https://images.rentbabe.com/assets/mui/help.svg"
                            /></Typography> :  <Typography  variant="caption" color="error">Referral withdrawal fees <DefaultTooltip
                            width={16}
                            margin='0 0 0 0px'
                            title={<Typography variant='body2' whiteSpace="pre-line"
                            dangerouslySetInnerHTML={{ __html: `${t("referral.withdraw.hint")}`}}
                            ></Typography>}
                            url="https://images.rentbabe.com/assets/mui/help.svg"
                    /></Typography>
                }

                    <TextField
                        value={amount}
                        fullWidth
                        onChange={handleAmountChange}
                        error={amountError}
                        helperText={amountErrorMessage}
                        margin="dense"
                        autoComplete="off"
                        label="Credit amount"
                        color="secondary"
                        InputProps={{
                            inputComponent: NumberFormatCustom as any,
                        }}
                    />
                </Box>
                <FormControl fullWidth sx={{ mt: 4 }}>
                    <InputLabel id="currency-select-label" color="secondary">Bank Account Country</InputLabel>
                    <Select
                        labelId="currency-select-label"
                        id="currency-select"
                        value={currency}
                        label="Bank Account Country"
                        onChange={handleCurrencyChange}
                        autoComplete="off"
                        color="secondary"
                    >
                        {currecyCountryList.map((item, index) => {
                            return (
                                <MenuItem key={index} value={item.currency}>
                                    <img
                                        loading="lazy"
                                        width="20"
                                        height="20"
                                        src={`https://flagcdn.com/w20/${item.countryCode.toLowerCase()}.png`}
                                        srcSet={`https://flagcdn.com/w40/${item.countryCode.toLowerCase()}.png 2x`}
                                        alt=""
                                        style={{ marginRight: "10px", border: '1px solid #ddd', borderRadius: '50%' }}
                                    /> {item.countryName}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                <br />
                <Box sx={{ p: 2 }}>
                    {props.penalty ? getCalculationRow('–', 'Penalty', props.penalty.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}) ?? '') : ''}
                    {getCalculationRow('–', 'Fee', transferFee.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}) ?? '', creditType !== CreditType.referral &&props.isReferredUser && 'Referred users enjoy 10% discount on platform fee')}
                    {getCalculationRow('=', 'Amount converted', (Number(amount) - props.penalty - transferFee).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}) ?? '')}
                    {getCalculationRow('×', 'Rate', conversionRate.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: undefined}) ?? '')}
                    <Divider />
                    {quotation && (
                        <Typography mt={1} variant="h5">
                            { isLoading ? <Skeleton width="150px" /> : `${quotation?.targetCurrency} ${((Number(amount) - props.penalty - transferFee) * conversionRate).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}` }
                        </Typography>
                    )}
    
                    {quotation?.formattedEstimatedDelivery && 
                        <Typography variant="caption">
                            { isLoading ? <Skeleton width="200px" /> : <span>Should arrive <strong>{quotation?.formattedEstimatedDelivery}</strong></span>}
                        </Typography>
                    }
                </Box>
                <br />
                <Button 
                variant="contained" 
                color="success" 
                fullWidth={true}
                disabled={isLoading || !amount || !currency || amountError || !quotation?.id}
                onClick={handleContinue}
                >{(isLoading  && !amountError) ? <CircularProgress size={24} /> : `Continue`}</Button>
            </Box>
        )}
        </>
    );
}

export { Quotation };