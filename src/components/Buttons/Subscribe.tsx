import { Typography } from "@mui/material";
import { Box, BoxProps, styled } from "@mui/system";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import shallow from "zustand/shallow";
import "../../scss/components/Buttons/button.scss";
import { useUser } from "../../store";

const GradientButton = styled(Box)`
  border-radius: 100px;
  height: 42px;
  background: linear-gradient(45deg, #ffed34 30%, #ffd144 90%);
  width: 170px;
  padding: 0px;
`;
const PremiumGradientButton = styled(Box)`
  border-radius: 100px;
  height: 42px;
  border: 1px solid #cccccc;
  padding: 0px;

`;
interface props extends BoxProps {
  className?: string;
}
const SubscribeButton: FC<props> = ({ className = "", ...props }) => {
  //const helper = new Helper();

  const [isPremium] = useUser(
    (state) => [state.currentUser?.isPremium],
    shallow
  );
  const { t } = useTranslation();

  return (
    <>
      {isPremium ? (
        <PremiumGradientButton
          className={`subscribe-button ${className}`}
          // bgcolor={isAdmin === false && uid ? "red" : "black"}
          // onClick={onClick}
          // width={helper.isMobileCheck2() ? "50%" : "auto"}
          {...props}
        >
          <Typography  fontSize={16} fontWeight={700}>
            {t("updatesub.button")}
          </Typography>
        </PremiumGradientButton>
      ) : (
        <GradientButton
          className={`subscribe-button ${className}`}
          // bgcolor={isAdmin === false && uid ? "red" : "black"}
          // onClick={onClick}
          // width={helper.isMobileCheck2() ? "50%" : "auto"}
          {...props}
        >
          <Typography fontSize={16} fontWeight={700}>
            {t("upgrade.button")}
          </Typography>
        </GradientButton>
      )}
    </>

    // <>
    //   {isPremium ? (
    //     <PremiumGradientButton
    //     {...props}
    //     >
    //        <CenterFlexBox  >
    //        { t("updatesub.button")}

    //        </CenterFlexBox>
    //     </PremiumGradientButton>
    //   ) : (
    //     <GradientButton {...props}

    //     >
    //       <CenterFlexBox style={{display: 'inline-block'}}>
    //       { t("upgrade.button")}

    //       </CenterFlexBox>
    //     </GradientButton>
    //   )}
    // </>
  );
};
export default SubscribeButton;
