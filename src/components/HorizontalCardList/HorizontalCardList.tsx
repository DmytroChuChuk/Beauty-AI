import { Typography, Box } from "@mui/material";
import { ContextType, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import "react-horizontal-scrolling-menu/dist/styles.css";
import { useWindowSize } from "../../hooks/useWindowSize";
import { BackIcon, NextIcon } from "../../icons/materialUiSvg";
import { Item } from "../../keys/props/profile";
import { ServiceType } from "../../keys/props/services";
import { Dummy } from "../../pages/RentPage";
import "../../scss/components/HorizontalCardList.scss";
import { Helper } from "../../utility/Helper";
import CenterFlexBox from "../Box/CenterFlexBox";
import { RenderComponentProps } from "../Masonry";
import NewRentCard from "../RentPage/NewRentCard";
import "./hideScrollbar.scss";
interface ListProps {
  items: any[];
  title: string;
  serviceType?: ServiceType;
  loadMore?: () => void;
  onNext?: () => void;
  onScroll?: () => void;
  openProfile: (
    item: Item,
    selectedServiceType?: ServiceType,
    selectedServiceId?: string
  ) => void;
}
export function HorizontalCardList({ items, title, serviceType, openProfile,loadMore, onNext, onScroll }: ListProps) {
  type scrollVisibilityApiType = ContextType<typeof VisibilityContext>;

  const apiRef = useRef({} as scrollVisibilityApiType);
  const helper = new Helper();
  const isMobile = helper.isMobileCheck2();
  const [width, setWidth] = useState(256);
  const [size] = useWindowSize();
  const {
    isLastItemVisible,
  } = useContext(VisibilityContext);


  const cardWidth = {
    web: 256,
    tab: 221,
    mobile: 197,
  };

  const screenSize = isMobile ? "small" : "large";
  useEffect(() => {
    if (isLastItemVisible && loadMore) {
      loadMore();
    }
    // eslint-disable-next-line
  }, [isLastItemVisible]);

  useEffect(() => {
    if (size.width < 421 || isMobile) {
      setWidth(cardWidth.mobile);
    } else if (size.width < 850) {
      setWidth(cardWidth.tab);
    } else {
      setWidth(cardWidth.web);
    }
    // eslint-disable-next-line
  }, [size.width]);

  const getCard = useCallback(
    ({ index, data, width }: RenderComponentProps<Item | Dummy>) => {

      const item = data as Item;

      return (
        <NewRentCard
          key={`${item.uid}-${index}`}
          sortedBy={"-1"}
          serviceType={serviceType !== undefined ? serviceType : (item.gonow_servce ?? ServiceType.meetup)}
          index={index}
          width={width}
          item={item}
          openProfile={(serviceType, serviceId) => {
            openProfile(item, serviceType, serviceId);
          }}
          announcement={false}
          postService={undefined}
          isHorizontalListCard={true}
        />
      );
    },
    // eslint-disable-next-line
    []
  );
  return (
    <Box sx={{
      padding: `0px ${size.width < 1280 ? 16 : 40}px`
    }}>
      <div className="header-row-main">
        <CenterFlexBox>
          <Typography
            fontWeight={"bold"}
            fontSize={screenSize === "small" ? 16 : 18}
          >
            {title}
          </Typography>
        </CenterFlexBox>
        {screenSize !== "small" && (
          <CenterFlexBox className="nav-box">
            <CenterFlexBox
              className="nav-icon-box"
              onClick={() => {
                apiRef.current.scrollPrev();
              }}
            >
              <BackIcon />
            </CenterFlexBox>
            <CenterFlexBox
              className="nav-icon-box"
              onClick={() => {
                apiRef.current.scrollNext();
                onNext?.();
              }}
            >
              <NextIcon />
            </CenterFlexBox>
          </CenterFlexBox>
        )}
      </div>
      <div>
        <ScrollMenu onScroll={onScroll} apiRef={apiRef}
        >
          {items.map((item, i) => ({
            ...getCard({ index: i, data: item, width }),
          }))}
        </ScrollMenu>
      </div>
    </Box>
  );
}
