import styled from "@emotion/styled";

import MuiAccordionSummary, {
    AccordionSummaryProps,
} from '@mui/material/AccordionSummary';

interface props extends AccordionSummaryProps{
  darkMode?: boolean
}

export const AdminAccordionSummary = styled((props: props) => (

    <MuiAccordionSummary
      expandIcon={<img src = {props.darkMode ? "https://images.rentbabe.com/assets/mui/white_forward_arrow.svg" : "https://images.rentbabe.com/assets/mui/forward_arrow.svg"} alt=""/>}
      {...props}
    />
  ))(() => ({
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    }
  }));