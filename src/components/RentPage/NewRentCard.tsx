import {
  AvatarGroup,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Timestamp } from "firebase/firestore";
import { FC } from "react";
import { sortBy } from "../../enum/MyEnum";
import Lighting from "../../icons/lighting";
import StatusDot from "../../icons/status-dot";
import { lowest } from "../../keys/firestorekeys";
import { Item } from "../../keys/props/profile";
import { ServiceType, detailProps } from "../../keys/props/services";
import { Calculator } from "../../utility/Calculator";
import { Helper } from "../../utility/Helper";
import { ServicesHelper } from "../../utility/ServicesHelper";
import ImageWithFallback from "../Misc/ImageWithFallback";
import BasicTypography from "../Typography/BasicTypography";
import VoiceButton from "../Voice/VoiceButton";
import PriceLabel from "./components/PriceLabel";
import ServicesIcon from "./components/ServicesIcon";
import { useTranslation } from "react-i18next";
import DefaultTooltip from "../Tooltip/DefaultTooltip";

interface props {
  sortedBy: string;
  serviceType?: ServiceType;
  serviceId?: string;
  index: number;
  width: number;
  item: Item;
  openProfile: (
    serviceType: ServiceType | undefined,
    serviceId: string | undefined
  ) => void;
  postService: [ServiceType | undefined, number | undefined] | undefined;
  announcement?: boolean;
  isHorizontalListCard?: boolean;
}

const NewRentCard: FC<props> = ({
  sortedBy,
  serviceType: sType,
  serviceId: sId,
  index,
  width,
  item,
  openProfile,
  postService,
  announcement = false,
  isHorizontalListCard,
}) => {

  const { t } = useTranslation();
  const servicesHelper = new ServicesHelper();
  const numberOfServices = servicesHelper.getNumberOfServices(item.services);
  // const getTotalNumberOfServices = servicesHelper.getTotalNumberOfServices(item.services)

  const helper = new Helper();
  const iAmFreeToday = announcement
    ? false
    : item?.end
    ? helper.amIFreeToday(Timestamp.fromDate(item.end))
    : false;

  const isMobile = helper.isMobileCheck2();
  const size = isMobile ? "small" : "large";
  const cal = new Calculator();
  const specific = getSpecific();

  const serviceId =
    postService?.[1] !== undefined ? postService?.[1].toString() : sId;

  const serviceType = (function getServiceType() {
    if (postService?.[0] !== undefined) {
      return postService?.[0];
    } else {
      if (sortedBy === sortBy.LOWEST_PRICE.toString()) {
        if (serviceId === "-1") {
          // get the cheapest services
          const cheapest = item?.sbyprt?.[lowest];
          const [key, cat] = servicesHelper.getCheapestService(
            cheapest,
            item.services
          );
          if (key && cat) {
            return parseInt(key);
          }
        } else if (serviceId === "-2") {
          // get the cheapest gaming services
          const cheapest =
            item?.sbyprt?.[ServiceType.games.toString()]?.[lowest];
          const [key, cat] = servicesHelper.getCheapestService(
            cheapest,
            item.services
          );
          if (key && cat) {
            return parseInt(key);
          }
        }
      }

      return specific?.serviceType === undefined
        ? sType
        : specific?.serviceType;
    }
  })();
  function formatAMPM(date: Date | undefined): string[] {
    if (!date) return [];

    var hours = date.getHours();
    var minutes: string | number = date.getMinutes();
    var ampm = hours >= 12 ? " PM" : " AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes;
    return [strTime, ampm];
  }
  function getSpecific() {
    const defaulter =
      servicesHelper.getFirstDetailByType(item.services, sType) ??
      servicesHelper.getFirstServiceDetail(item.services);

    if (postService) {
      return (
        (item?.services?.[`${postService[0]}`]?.[`${sId}`] as
          | detailProps
          | undefined) ?? defaulter
      );
    } else {
      if (sortedBy === sortBy.LOWEST_PRICE.toString()) {
        if (sId === "-1") {
          // get the cheapest services
          const cheapest = item?.sbyprt?.[lowest];
          const [key, cat] = servicesHelper.getCheapestService(
            cheapest,
            item.services
          );
          if (key && cat) {
            return (
              (item?.services?.[`${key}`]?.[`${cat}`] as
                | detailProps
                | undefined) ?? defaulter
            );
          }
        } else if (sId === "-2") {
          // get the cheapest gaming services
          const cheapest =
            item?.sbyprt?.[ServiceType.games.toString()]?.[lowest];
          const [key, cat] = servicesHelper.getCheapestService(
            cheapest,
            item.services
          );
          if (key && cat) {
            return (
              (item?.services?.[`${key}`]?.[`${cat}`] as
                | detailProps
                | undefined) ?? defaulter
            );
          }
        }
      }

      return (
        (item?.services?.[`${sType}`]?.[`${sId}`] as detailProps | undefined) ??
        defaulter
      );
    }
  }

  function getServiceId() {
    if (postService?.[1] !== undefined) {
      return postService?.[1].toString();
    } else {
      if (sortedBy === sortBy.LOWEST_PRICE.toString()) {
        if (sId === "-1") {
          // get the cheapest services
          const cheapest = item?.sbyprt?.[lowest];
          const [key, cat] = servicesHelper.getCheapestService(
            cheapest,
            item.services
          );
          if (key && cat) {
            return cat;
          }
        } else if (sId === "-2") {
          // get the cheapest gaming services
          const cheapest =
            item?.sbyprt?.[ServiceType.games.toString()]?.[lowest];
          const [key, cat] = servicesHelper.getCheapestService(
            cheapest,
            item.services
          );
          if (key && cat) {
            return cat;
          }
        }
      }

      return sId;
    }
  }

  const firstprice =
    specific?.price ??
    (serviceType
      ? servicesHelper.getFirstServicePriceByType(item.services, serviceType)
      : servicesHelper.getFirstServicePrice(item.services));

  const prevPrice = item.price;
  const price = firstprice ? firstprice / 100 : prevPrice;

  const suffix =
    serviceType !== undefined && isNaN(serviceType)
      ? "1Hr"
      : servicesHelper.convertUnits(specific?.suffix);

  const onClick = () => {
    if (!item.nickname) {
      return;
    }

    openProfile(sType, specific?.id ?? specific?.category ?? getServiceId());
  };

  return (
    <Box
      data-key={index}
      className="wf-box"
      key={`${item.uid}-${index}`}
      id={`wf-box-${item.uid}`}
      sx={{
        width: width,
        aspectRatio: { xs: "1/2", md: "3/5" },
        maxHeight: isHorizontalListCard ? "346px" : "384px",
        marginBottom: isHorizontalListCard ? "10px" : "0px",
        marginTop: isHorizontalListCard ? "10px" : "0px",
      }}
  
    >
      <Card
        sx={{
          padding: { xs: "4px", md: "8px" },
          width: "100%",
          aspectRatio: { xs: "1/2", md: "3/5" },
          maxHeight: isHorizontalListCard ? "346px" : "384px",
          borderRadius: 4,
          boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.20)",
        }}
        
      >
        <CardContent sx={{ p: "0 !important" }}>

          <Box
            width="100%"
            height="100%"
            position="absolute"
            zIndex={9}
            onClick={() => openProfile(serviceType, serviceId)}
          />

          <Stack spacing={"10px"}>
            {!isHorizontalListCard && (
              <Stack
                flex={1}
                direction="row"
                justifyContent="space-between"
                px="8px"
              >
                <Stack direction="row" spacing="8px" alignItems="center">
                  <Typography
                    variant="h4"
                    fontSize={size === "small" ? 16 : 18}
                    fontWeight="bold"
                  >
                    {item.nickname?.capitalize()}
                  </Typography>
                  {item.isOnline && <StatusDot />}
                </Stack>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", position: "absolute", right: "19px", zIndex: 10}}>
                  {item.videoVerification && (
                    <DefaultTooltip 
                    width={size === "small" ? 20 : 24} 
                    title={t("verified.done")}
                    url="https://images.rentbabe.com/assets/flaticon/card.svg"/> 
                  )}
                  {item.isgToken && (
                      <DefaultTooltip 
                      width={size === "small" ? 20 : 24} 
                      title="Instagram verified" 
                      url="https://images.rentbabe.com/assets/igfill.svg"/>
                  )}
                </Box>
              </Stack>
            )}
            <Stack flex={8} position="relative">
              {iAmFreeToday ? (
                isHorizontalListCard ? (
                  item.gonow_servce === ServiceType.meetup ? (
                    <Chip
                      label={
                        <Typography marginLeft={-1} fontSize="inherit">
                          {item.gonow_coming_from ?? "Town"}
                        </Typography>
                      }
                      sx={{
                        position: "absolute",
                        display: "flex",
                        backgroundColor: "rgba(26, 26, 26, 0.45)",
                        top: 8,
                        left: 8,
                        paddingLeft: "8px",
                        paddingRight: "4px",
                        backdropFilter: "blur(10px)",
                        color: "#FFF",
                        fontSize: size === "small" ? 12 : 14,
                        lineHeight: size === "small" ? 16 : 20,
                      }}
                      icon={<Lighting size={size === "small" ? 16 : 20} />}
                    />
                  ) : (
                    <></>
                  )
                ) : (
                  <Chip
                    label={
                      <Typography marginLeft={-1} fontSize="inherit">
                        {t("ava.today")}!
                      </Typography>
                    }
                    sx={{
                      position: "absolute",
                      display: "flex",
                      backgroundColor: "rgba(26, 26, 26, 0.45)",
                      top: 8,
                      left: 8,
                      paddingLeft: "8px",
                      paddingRight: "4px",
                      backdropFilter: "blur(10px)",
                      color: "#FFF",
                      fontSize: size === "small" ? 12 : 14,
                      lineHeight: size === "small" ? 16 : 20,
                    }}
                    icon={<Lighting size={size === "small" ? 16 : 20} />}
                  />
                )
              ) : (
                <></>
              )}
              {item.services && numberOfServices > 0 && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    position: "absolute",
                    bottom: -14,
                    width: "100%",
                    px: "8px",
                  }}
                >
                                                     <AvatarGroup 
                                        spacing={14}
                                        sx={{
                                            '& .MuiAvatar-root': { width: 32, height: 32, fontSize: 14, zIndex: 10 },
                                        }}
                                        // max={2} 
                                        // total={getTotalNumberOfServices}
                                    >

                                        <ServicesIcon
                                            label={{[parseInt(`${serviceType}`)]: parseInt(`${(specific?.id?.length ?? 0) > 3 ? specific?.category : specific?.id}`) }}
                                        />

                                        {/* <Avatar alt="Drinks" sx={avatarStyles}>
                                                <img src={DrinksIcon} alt="Drinks" width={24} />
                                        </Avatar> */}

                                    </AvatarGroup>

                  {item.voiceUrl && (

                    <Box position="absolute" zIndex={10} right="8px">
                      <VoiceButton
                        gray
                        voiceUrl={item.voiceUrl}
                        marginTop={"4px"}
                      />
                    </Box>

                  )}
                </Stack>
              )}
              {item.visible && !announcement ? (
                <Box
                  sx={{
                    height: "240px",
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  <video
                    id={`video-${item.uid}`}
                    src={item.video_urls?.[0]?.toCloudFlareURL()}
                    onClick={onClick}
                    height="100%"
                    width="100%"
                    autoPlay
                    playsInline
                    muted
                    loop
                    style={{
                      objectFit: "cover",
                      borderRadius: "16px",
                      objectPosition: "center",
                    }}
                  />
                </Box>
              ) : (
                <ImageWithFallback
                  fallback={[
                    item.mobileUrl?.toCloudFlareURL() ?? "",
                    item.urls.length > 0 ? item.urls[0].toCloudFlareURL() : "",
                  ]}
                  alt={item.nickname}
                  height="240px"
                  srcSet={`${
                    item.urls.length > 0
                      ? item.urls[0].toCloudFlareURL()
                      : "emp"
                  }`.srcSetConvert()}
                  style={{
                    borderRadius: 16,
                    objectPosition: "center",
                    objectFit: "cover",
                  }}
                />
              )}
            </Stack>
            <Box sx={{ height: "10px" }} />
            <Stack padding={"0px 8px"} spacing={"4px"} flex={1}>
              {iAmFreeToday && item.start && item.end && isHorizontalListCard && (
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <BasicTypography
                    fontSize={size === "small" ? 14 : 18}
                    fontWeight="500"
                    color="black"
                  >
                    {formatAMPM(item.start)[0] +
                      " " +
                      formatAMPM(item.start)[1]}{" "}
                    - {formatAMPM(item.end)}
                  </BasicTypography>
                </Stack>
              )}
              <Stack direction="row" spacing={0.6} alignItems="center">
                <img
                  width={24}
                  height={24}
                  src="https://images.rentbabe.com/assets/flaticon/star.svg"
                  alt=""
                />
                {cal.weightedAverageValue(item?.ratings) ? (
                  <>
                    <Typography fontSize={16} fontWeight={700} color="#646464">
                      {cal.weightedAverageValue(item?.ratings).toFixed(1)}
                    </Typography>
                    <Typography fontSize={16} fontWeight={400} color="#999999">
                      ({cal.weightedAverageNumberOfRents(item?.ratings)})
                    </Typography>
                  </>
                ) : (
                  <Typography fontSize={16} fontWeight={700} color="#646464">
                    ---
                  </Typography>
                )}
              </Stack>
              {!(iAmFreeToday && isHorizontalListCard) && (
                <PriceLabel
                  imageSize={24}
                  fontSize={size === "small" ? 16 : 20}
                  fontSize2={size === "small" ? 12 : 14}
                  fontWeight2="400"
                  fontWeight="bold"
                  color="black"
                  suffix={suffix}
                  itemPrice={price}
                />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NewRentCard;
