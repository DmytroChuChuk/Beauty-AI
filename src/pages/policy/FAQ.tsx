import { FC, useState }  from 'react';

import '../scss/FAQ.scss'

import { Helmet } from "react-helmet";
import PageHeader from '../../components/Headers/PageHeader';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, AccordionDetails, Accordion, Typography } from '@mui/material';
import CenterFlexBox from '../../components/Box/CenterFlexBox';
import { AdminAccordionSummary } from '../../components/adminpage/components/AdminAccordionSummary';
import { termsImage } from '../../data/images';

export enum FAQEnums {
    general = "general",
    rules = "rules",
    refunds = "refunds",
    credits = "credits",
    howtorent = "howtorent",
    agency = "agency"
}

const FAQAccordion: FC<{
    expanded: boolean
    question:string,
    answer:string,
    url?: string,
    onChange: (event: React.SyntheticEvent, expanded: boolean) => void
}> = ({expanded, question, answer, url, onChange}) => { 
    return <Accordion
    sx={{maxWidth: "800px", width: "100%"}} 
    expanded={expanded} 
    onChange={onChange}>

    <AdminAccordionSummary sx={{background: expanded ? "#f0f0f0" : "white"}} >
        <Typography fontWeight="bold" color={expanded ? "secondary" : "inherit"}>{question}</Typography>
    </AdminAccordionSummary> 

    <AccordionDetails>
        <Typography color="text.secondary">{answer}</Typography>
       
       <CenterFlexBox marginTop={2}>
        {url && <> <br/><img style={{cursor: "pointer"}}
            onClick={() => window.open(url, "_blank")} width={300} src={url} alt=''></img>
        </>}
       </CenterFlexBox>


    </AccordionDetails>

</Accordion>
}

const FAQ: FC = () => {

    enum panels {
        general1 = "general1",
        general2 = "general2",
        general3 = "general3",
        general4 = "general4",
        general5 = "general5",
        general6 = "general6",
        rules1 = "rules1",
        rules2 = "rules2",
        rules3 = "rules3",
        howtorent1 = "howtorent1",
        howtorent2 = "howtorent2",
        refunds1 = "refunds1",
        refunds2 = "refunds2",
        credits1 = "credits1",
        credits2 = "credits2",
        credits3 = "credits3",
        credits4 = "credits4",
        credits5 = "credits5",
        credits6 = "credits6",
    }

    const { t } = useTranslation()

    const page = window.location.href.getQueryStringValue("ref")
    const faq : FAQEnums = FAQEnums[page as keyof typeof FAQEnums]

    const [tab, setTab] = useState<FAQEnums>(faq ?? FAQEnums.general)
    const [expanded, setExpanded] = useState<string | boolean>(false)

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setTab( FAQEnums[newValue as keyof typeof FAQEnums] )
    }

    const onChange = (panel: string) => (_ : any, isExpanded : boolean) => {
        setExpanded(isExpanded ? panel : false);
    };
  

    const generalSection = () => {
        return <>{
                    tab === FAQEnums.general && <>
                        <FAQAccordion 
                            expanded = {expanded === panels.general1}
                            question={t("question1.faq")}
                            answer={t("answer1.faq")}
                            onChange={onChange(panels.general1)}

                        />
                        <FAQAccordion 
                            expanded = {expanded === panels.general2}
                            question={t("question2.faq")}
                            answer={t("answer2.faq")}
                            onChange={onChange(panels.general2)}
                        />
                        <FAQAccordion 
                            expanded = {expanded === panels.general3}
                            question={t("question3.faq")}
                            answer={t("answer3.faq")}
                            url="https://images.rentbabe.com/IMAGES/FAQ/beababebutton.png"
                            onChange={onChange(panels.general3)}
                        />
                        <FAQAccordion 
                            expanded = {expanded === panels.general4}
                            question={t("question5.faq")}
                            answer={t("answer5.faq")}
                            onChange={onChange(panels.general4)}
                        />
                        <FAQAccordion 
                            expanded = {expanded === panels.general5}
                            question={t("question9.faq")}
                            answer={t("answer9.faq")}
                            onChange={onChange(panels.general5)}
                        />
                        <FAQAccordion 
                            expanded = {expanded === panels.general6}
                            question={t("question7.faq")}
                            answer={t("answer7.faq")}
                            onChange={onChange(panels.general6)}
                        />
                    </>
                }
        </>
    }

    const ruleSection = () => {

        return <>
                {
                    tab === FAQEnums.rules && <>

                        <FAQAccordion 
                            expanded = {expanded === panels.rules3}
                            question={t("question6.faq")}
                            answer={t("answer6.faq")}
                            onChange={onChange(panels.rules3)}
                        />

                        <FAQAccordion 
                            expanded = {expanded === panels.rules2}
                            question={t("question10.faq")}
                            answer={t("answer10.faq")}
                            url={termsImage}
                            onChange={onChange(panels.rules2)}
                        />
                    </>
                }
        </>
    }

    const howToRentSection = () => {
        return <>
        {
            tab === FAQEnums.howtorent && <>
                <FAQAccordion 
                    expanded = {expanded === panels.howtorent1}
                    question={t("question4.faq")}
                    answer={t("answer4.faq")}
                    onChange={onChange(panels.howtorent1)}
                />
                <FAQAccordion 
                    expanded = {expanded === panels.howtorent2}
                    question={t("question11.faq")}
                    answer={t("answer11.faq")}
                    onChange={onChange(panels.howtorent2)}
                />
            </>
        }
        </>
    }

    const refundSection = () => {
        return <>
            {tab === FAQEnums.refunds && <>
                    <FAQAccordion 
                        expanded = {expanded === panels.refunds1}
                        question={t("question8.faq")}
                        answer={t("answer8.faq")}
                        onChange={onChange(panels.refunds1)}
                    />
                    <FAQAccordion 
                        expanded = {expanded === panels.refunds2}
                        question={t("question12.faq")}
                        answer={t("answer12.faq")}
                        onChange={onChange(panels.refunds2)}
                    />
            </>}
        </>
    }

    const creditSection = () => {
        return <>
            {tab === FAQEnums.credits && <>

                <FAQAccordion 
                    expanded = {expanded === panels.credits1}
                    question={t("question15.faq")}
                    answer={t("credit.balance")}
                    onChange={onChange(panels.credits1)}
                />

                <FAQAccordion 
                    expanded = {expanded === panels.credits2}
                    question={t("question16.faq")}
                    answer={t("credit.pending")}
                    onChange={onChange(panels.credits2)}
                />
                <FAQAccordion 
                    expanded = {expanded === panels.credits3}
                    question={t("question17.faq")}
                    answer={t("credit.income")}
                    onChange={onChange(panels.credits3)}
                />

                <FAQAccordion 
                        expanded = {expanded === panels.rules1}
                        question={t("question5.faq")}
                        answer={t("answer5.faq")}
                        onChange={onChange(panels.rules1)}
                    />

                <FAQAccordion 
                    expanded = {expanded === panels.credits5}
                    question={t("question13.faq")}
                    answer={t("answer13.faq")}
                    onChange={onChange(panels.credits5)}
                />

                <FAQAccordion 
                    expanded = {expanded === panels.credits4}
                    question={t("question5.faq")}
                    answer={t("answer5.faq")}
                    onChange={onChange(panels.credits4)}
                />

                <FAQAccordion 
                    expanded = {expanded === panels.credits6}
                    question={t("question14.faq")}
                    answer={t("answer14.faq")}
                    onChange={onChange(panels.credits6)}
                />
                
            </>}
        </>

    }

    return <div  > 
        <Helmet>
            <title>FAQ | RentBabe</title>
            <meta name="description" content="RentBabe common questions and answers" />
            <meta property="og:title" content="FAQ | RentBabe" />
        </Helmet>

        <PageHeader title ={"FAQ"}/>

        {/* <CenterFlexBox width="100%">
                <Translation 
                    onChange={(value) => {
                    i18n.changeLanguage(value)
                    }}
                />
        </CenterFlexBox> */}

        <CenterFlexBox>
            <Tabs 
              scrollButtons
              allowScrollButtonsMobile
              variant="scrollable"
    
                textColor='secondary' 
                indicatorColor='secondary' 
                value={tab} 
                onChange={handleChange}>
                
                <Tab value={FAQEnums.general} label="General"/> 
                <Tab value={FAQEnums.howtorent} label="How to Rent?"/> 
                <Tab value={FAQEnums.rules} label="Rules"/> 
                <Tab value={FAQEnums.refunds} label="Refunds"/> 
                <Tab value={FAQEnums.credits} label="Credits"/> 
                {/* <Tab value={FAQEnums.agency} label="Agency"/>  */}

            </Tabs>
        </CenterFlexBox>

        <br/>
        <div>
            <CenterFlexBox paddingLeft={1} paddingRight={1} flexDirection="column">

                {generalSection()}
                {ruleSection()}
                {howToRentSection()}
                {refundSection()}
                {creditSection()}


            </CenterFlexBox>
            <br/>
            <br/>
            <br/>
        </div>

    </div>};

export default FAQ;