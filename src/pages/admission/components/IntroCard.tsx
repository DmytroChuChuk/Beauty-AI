import { Box, Card, CardHeader, Divider, Typography } from "@mui/material";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import shallow from "zustand/shallow";
import CenterFlexBox from "../../../components/Box/CenterFlexBox";
import { ApplyFreeButton } from "../../../components/Buttons";
import { Why1, Why2, Why3 } from "../../../icons/materialUiSvg";
import { reject_reason } from "../../../keys/firestorekeys";
import "../../../scss/components/Intro.scss";
import { useUser } from "../../../store";
import { Helper } from "../../../utility/Helper";

interface props {
  data: any;
  onClickNext: () => void;
}

const IntroCard: FC<props> = ({ data, onClickNext }) => {
  const { t } = useTranslation();
  const helper = new Helper();

  const isMobile = helper.isMobileCheck2();
  const [isAdmin] = useUser((state) => [state?.currentUser?.isAdmin], shallow);

  return (
    <Card
      style={{
        width: isMobile ? "90%" : 393,
        borderRadius: "24px",
        padding: 24,
       
      }}
    >
      <Box display="flex" zIndex={1} width="100%">
        <Box>
          <Typography className="intro-heading-main">
            {t("babe.button")}
          </Typography>
          <Typography className="intro-heading-sub">
            {t("intro1.header")}, {t("intro2.header")}
          </Typography>
          <Typography className="intro-heading-sub">
            {t("intro3.header")}
          </Typography>
        </Box>
      </Box>
      <Box flexDirection="column" marginTop={2}>
        {isAdmin === false ? (
          <Box
            sx={{
              backgroundColor: "#F0F0F0",
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
            }}
          >
            <Typography className="description-heading">
              {t("intro.review")}
            </Typography>
            <Typography color={"#646464"} fontSize={"10px"} fontWeight={400}>
              {t("intro.under.review")}
            </Typography>
          </Box>
        ) : isAdmin === undefined && data?.get(reject_reason as string) ? (
          <Box>
            <ApplyFreeButton
              onClick={onClickNext}
              text={t("apply.button")}
              marginBottom={2}
            />

            <Box
              sx={{
                backgroundColor: "#FDF1F1",
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
              }}
            >
              <Typography className="review-heading-rejected">
                {t("intro.rejected")}
              </Typography>
              <Typography className="review-description-rejected">
                {
                  "Please write a proper one-liner intro for all your services. Please resubmit your application by clicking “Be a Babe”"
                }
                {/* {data?.get(reject_reason) as string} */}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <ApplyFreeButton onClick={onClickNext} text={t("apply.button")} />
          </Box>
        )}
      </Box>
      <Box marginTop={2} marginBottom={2}>
        <Box display="flex" alignItems={"center"}>
          <img
            width="24px"
            height="24px"
            src="https://images.rentbabe.com/assets/rentblogo.svg"
            alt=""
          />
          <Typography className="who-are-we-heading">
            {t("intro.title")}
          </Typography>
        </Box>

        <Typography marginTop={1} className="description-text ">
          {t("intro.description")}
        </Typography>
      </Box>
      <Box>
        <Divider />
        <CardHeader
          avatar={
            <CenterFlexBox className="why-icon">
              <Why1 />
            </CenterFlexBox>
          }
          title={
            <Typography className="description-heading">
              {t("intro.why1.title")}
            </Typography>
          }
          // info?.replace(phoneExp, censor).replace(emailExp, censor)
          subheader={
            <Typography className="description-text ">
              {t("intro.why1.desc")}
            </Typography>
          }
        />
        <CardHeader
          avatar={
            <CenterFlexBox className="why-icon">
              <Why2 />
            </CenterFlexBox>
          }
          title={
            <Typography className="description-heading">
              {t("intro.why2.title")}
            </Typography>
          }
          // info?.replace(phoneExp, censor).replace(emailExp, censor)
          subheader={
            <Typography className="description-text ">
              {t("intro.why2.desc")}
            </Typography>
          }
        />
        <CardHeader
          avatar={
            <CenterFlexBox className="why-icon">
              <Why3 />
            </CenterFlexBox>
          }
          title={
            <Typography className="description-heading">
              {t("intro.why3.title")}
            </Typography>
          }
          // info?.replace(phoneExp, censor).replace(emailExp, censor)
          subheader={
            <Typography className="description-text ">
              {t("intro.why3.desc")}
            </Typography>
          }
        />
      </Box>
      <Divider />
      <Box marginTop={2}>
        <Typography className="description-heading">
          {t("intro.eligible.title")}
        </Typography>
        <div className="description-div">
          <Typography className="description-text ">{"1."}</Typography>
          <Typography className="description-text ">
            {t("intro.eligible1")}
          </Typography>
        </div>
        <div className="description-div">
          <Typography className="description-text ">{"2."}</Typography>
          <Typography className="description-text ">
            {t("intro.eligible2")}
          </Typography>
        </div>
        <div className="description-div">
          <Typography className="description-text ">{"3. "}</Typography>
          <Typography className="description-text ">
            {t("intro.eligible3")}
          </Typography>
        </div>
      </Box>
    </Card>
  );
};

export default IntroCard;
