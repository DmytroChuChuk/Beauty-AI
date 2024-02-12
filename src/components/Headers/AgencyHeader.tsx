import { Typography } from '@mui/material';
import { FC } from 'react';
import { cardGray } from '../../keys/color';
import CenterFlexBox from '../Box/CenterFlexBox';
import { CountryLookUpTable } from '../../data/tables';

import { collection, limit, query, where } from 'firebase/firestore';
import { AgencyEmail, AgencyFacebook, AgencyInstagram, AgencyWhatsapp, PAGE, name } from '../../keys/firestorekeys';
import { db } from '../../store/firebase';
import { useCollectionQuery } from '../../chats/hooks/useCollectionQuery';
import FlexBox from '../Box/FlexBox';
import { WhatsAppLogo } from '../../data/images';

interface props {
    clubName: string | null
    clubState: string | null
}

const AgencySocials : FC<{
  link: string,
  icon: string
}> = ({link, icon}) => {
  return <a href={link} target="_blank"  rel="noreferrer">
  <img
      style={{marginLeft: "4px", marginRight: "4px"}} 
      width={21}
      height={21} 
      src= {icon} alt=""></img>
  </a>
}

const AgencyHeader : FC<props> = ({clubName, clubState}) => {


  const limitCount = 1

  const { data } = useCollectionQuery(
    `${clubName}`,
    query(collection(db, PAGE) 
    ,where(name, "==" , clubName)
    ,limit(limitCount)), limitCount
  )

  const facebook = data && data.length > 0 ? data[0].get(AgencyFacebook) : null
  const instagram = data && data.length > 0 ? data[0].get(AgencyInstagram) : null
  const whatsapp: string | null = data && data.length > 0 ? data[0].get(AgencyWhatsapp) : null
  const email = data && data.length > 0 ? data[0].get(AgencyEmail) : null

  return <>{clubName && clubState && <CenterFlexBox 
      flexDirection="column" 
      bgcolor={cardGray} 
      paddingTop={1.5} 
      paddingBottom={1}
    >
      <Typography variant='caption' color="text.secondary">
        Welcome to <b>@{clubName} </b>agency from <b>{
          Object.keys(CountryLookUpTable).find(k=>CountryLookUpTable[k]===clubState)
        }</b>
      </Typography>

      <FlexBox marginTop={1}>

      {facebook && <AgencySocials link = {facebook} icon = "https://images.rentbabe.com/assets/fb_logo.svg" />}
      {instagram && <AgencySocials link = {instagram} icon = "https://images.rentbabe.com/assets/insta_logo_black.svg" />}
      {whatsapp && <AgencySocials link = {`https://wa.me/${whatsapp.replace("+", "")}`} icon = {WhatsAppLogo} />}
      {email && <img
          style={{marginLeft: "4px", marginRight: "4px", cursor: "pointer"}} 
          width={21}
          height={21}
          src = "https://images.rentbabe.com/assets/email.svg?v=1" 
          onClick={() => {
            window.open(`mailto:${email}` , '_blank')
          }} 
          alt=""
      />}


      </FlexBox> 

        <Typography fontWeight="bold" variant='caption' >Powered by <a rel="noreferrer" target="_blank" href="https://rentbabe.com">RentBabe.com</a></Typography>
      </CenterFlexBox>}
  </>
 
}

export default AgencyHeader