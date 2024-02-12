import { Tabs, Tab, TabsProps, Typography, Box} from '@mui/material';
import { FC, ReactNode, useState } from 'react';

import { styled } from '@mui/material/styles';
import { ServiceType, servicesProps} from '../../../keys/props/services';
import { useTranslation } from 'react-i18next';
import CenterFlexBox from '../../Box/CenterFlexBox';
import { logEvent } from 'firebase/analytics';
import { AnalyticsNames } from '../../../keys/analyticNames';
import { analytics } from '../../../store/firebase';
import FlexBox from '../../Box/FlexBox';
import FlexGap from '../../Box/FlexGap';
import { hideServicesKey } from '../../../keys/localStorageKeys';


interface StyledTabProps {
  label: ReactNode | string;
  value: number
}

const AntTab = styled((props: StyledTabProps) => <Tab {...props} />)(
    ({ theme }) => ({
      textTransform: 'none',
      minWidth: 0,
      [theme.breakpoints.up('sm')]: {
        minWidth: 0,
      },
      fontWeight: theme.typography.fontWeightRegular,
      marginRight: theme.spacing(1),
      color: 'rgba(255, 255, 255, 0.70)',
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      '&:hover': {
        color: 'rgba(255, 255, 255)',
        opacity: 1,
      },
      '&.Mui-selected': {
        color: '#fff',
        fontWeight: theme.typography.fontWeightMedium,
      },
      '&.Mui-focusVisible': {
        backgroundColor: '#d1eaff',
      },
    }),
  );

interface props extends TabsProps {
    index: number
    services: servicesProps | undefined
    hideServices?: boolean 
    valueChanged: (index: number) => void
    hideService: (hide: boolean) => void
}

const VerticalTabs : FC<props> = ({index, services, hideServices = false, valueChanged, hideService, ...props}) => {

    const labelValue = -1
    const { t } = useTranslation()
    const [value, setValue] = useState(hideServices ? labelValue : index)

    // const [hide, setHide] = useState(false)


    const onHide = () => {

      try{
        const name = hideServices ? "unhide" : "hide"
        const type = `${name} service`
        logEvent(analytics, AnalyticsNames.buttons, {
          content_type: type,
          item_id: type, 
        })  
      }catch{}

      if(!hideServices){
        //open 
        localStorage.setItem(hideServicesKey, "hide")
        setValue(labelValue)
      }else{
        // hide
        localStorage.removeItem(hideServicesKey)
        setValue(index)
      }

      hideService(!hideServices)
    }

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
      valueChanged(newValue);
    }

    const label = (title: string) => {
      return  <Typography textTransform="none" fontWeight="bolder" fontSize={12} variant='caption'
        >{title}
      </Typography>
    }
  
  
    function getTitle (value: number) : string {
  
      switch (value) {
        case ServiceType.meetup:
          return `${t("meetup.tab")}` //"Meetup"
        case ServiceType.eMeet:
          return `${t("emeet.tab")}` // "EMeet";
        case ServiceType.games:
          return `${t("games.tab")}` // "Games";
        case ServiceType.sports:
          return `${t("sports.tab")}` // "Games";
        default:
          return `${t("meetup.tab")}` // "Meetup"
      }
    }


    if(!services) return null

    else return  <Tabs
        {...props}
        orientation="vertical"
        value={value}
        onChange={handleChange}> 


      {!hideServices && <CenterFlexBox
        onClick={onHide}
        paddingTop={1}
        paddingBottom={0}
        sx={{
          width: 60,
          minWidth: 60, 
          minHeight: 21,
          maxHeight: 21
        }}
        >
          <img
            width={14}
            height={14}
            src="https://images.rentbabe.com/assets/icon/downtri.svg?v=1"
            alt=""
          />
        </CenterFlexBox>}

        {
          hideServices &&
          <Box onClick={onHide}>
            <AntTab
              key={labelValue} 
              value={0}
      
              sx={{
                width: 100,
                minWidth: 100, 
                marginRight: ".1rem", 
                marginLeft: ".1rem", 
              }}
              label={
                <FlexBox alignItems="center" color="white!important">
                  
                  
                  <b>Services</b>
                  <FlexGap gap={1}/>
                  <img
                    width={16}
                    height={16}
                    src="https://images.rentbabe.com/assets/mui/white_forward_arrow.svg"
                    alt=""
                  />
                </FlexBox>
                
   
              }
            />
          </Box>}

        {Object.entries(services).sort().map((value) => {

          const _data = value[1]
          delete _data["id"]
          const isEmpty = Object.values(_data).length === 0

          const _value = parseInt(value[0])

          if(isEmpty) return null
          else if(hideServices) return null
          else return <AntTab
            key={_value} 
            value={_value}
            sx={{
              width: 60,
              minWidth: 60, 
              marginRight: ".1rem", 
              marginLeft: ".1rem", 
              height: 40, 
              minHeight: 40
            }}
            label={
              label(getTitle(_value))
            }
          />})
        }

    </Tabs>
     
}

export default VerticalTabs