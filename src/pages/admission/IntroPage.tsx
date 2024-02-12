import { FC, useEffect, useState } from "react";
import shallow from "zustand/shallow";
import CenterFlexBox from "../../components/Box/CenterFlexBox";
import { useWindowSize } from "../../hooks/useWindowSize";
import "../../scss/components/Intro.scss";
import { useUser } from "../../store";
import { Helper } from "../../utility/Helper";
import history from "../../utility/history";
import { version } from "../../version/basic";
import IntroCard from "./components/IntroCard";
import IntroImageBox from "./components/IntroImageBox";
import { Alert, Box } from "@mui/material";

interface props {
  data: any;
}

// utm_medium=referral
// https://rentbabe.com/page/admission?%24web_only=true&_branch_match_id=1076086777985613991&utm_medium=referral&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXLy1OLSrWK0rNK0lKTErVS87P1U%2FVz8wryyxJ1S80zTfODfAqdq4MKbUMNM1MSsrI9UwMjXAt9TUCAOXJJ3lAAAAA

const IntroPage: FC<props> = ({ data }) => {
  const helper = new Helper();
  const [size] = useWindowSize();

  const isMobile = helper.isMobileCheck2();
  const [showImage, setShowImage] = useState(false);
  const [isAdmin, uid] = useUser(
    (state) => [state?.currentUser?.isAdmin, state?.currentUser?.uid],
    shallow
  );

  const isFromReferral = window.location.href.getQueryStringValue("utm_medium") === "referral"

  const onClickNext = async () => {
    if (!uid) {
      history.push("/Login", { chooseServices: true });
    } else if(isAdmin){
      // already sign up as babe, redirect to babe setting page
      window.location.href = `/page/Admin?uid${uid}`
    }else {
      history.push(`/page/setuplocation?v=${version}`);
    }
  };

  useEffect(() => {
    if (size.width < 1200) {
      setShowImage(false);
    } else {
      setShowImage(true);
    }
  }, [size.width]);
  
  return (<Box>
    { isFromReferral && <Alert>Sign up & Earn 10% more (lower platform fees) in the first 3 months.</Alert>}
    <CenterFlexBox className="intro-background">
      <CenterFlexBox className="intro-box" marginTop={3}  marginBottom={3}>
        <IntroCard data={data} onClickNext={onClickNext} />
        {showImage && !isMobile && <IntroImageBox />}
      </CenterFlexBox>
    </CenterFlexBox>
    </Box>
  );
};

export default IntroPage;
