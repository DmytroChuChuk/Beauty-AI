import React from "react";
import Typography, { TypographyProps } from "@mui/material/Typography";
import { logEvent } from "firebase/analytics";
import { AnalyticsNames } from "../../keys/analyticNames";
import { analytics } from "../../store/firebase";

interface EllipsisProps extends TypographyProps {
  children: any;
  lines: number;
}

const Ellipsis: React.FC<EllipsisProps> = (props) => {
  const hiddenTextRef = React.createRef<HTMLParagraphElement>();
  const textRef = React.createRef<HTMLParagraphElement>();
  const [minHeight, setMinHeight] = React.useState<number>(0);
  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const { children, ...restOfProps } = props;

  React.useEffect(() => {
    if (hiddenTextRef.current && textRef.current && children) {
      // set Height of Ellipsis Element

      setMinHeight(hiddenTextRef.current.clientHeight - 6);

      // Split paragraph into spans of words
      const content = children.toString()
        .split(" ")
        .map((a: any) => `<span>${a}</span>`)
        .join(" ");

      // put the spans into the typography element
      textRef.current.innerHTML = content;
      // span elements
      const spans: HTMLSpanElement[] = [];
      // position of each line
      let heights: number[] = [];
      textRef.current?.querySelectorAll("span").forEach((e) => {
        spans.push(e);
        heights.push(e.getBoundingClientRect().y);
      });

      // unique position of lines
      heights = Array.from(new Set(heights));

      // check if ellpsis is required

      if (heights.length <= props.lines) {
        setMinHeight(heights.length * 21)
        return;
      }
      // last line of ellpisis
      const spansOfLastLine = spans.filter(
        (s) => s.getBoundingClientRect().y === heights[props.lines - 1]
      );

      // more button
      const moreNode = document.createElement("span");
      moreNode.innerHTML = "...More";
      moreNode.style.fontWeight = "bold";
      moreNode.style.cursor = "pointer";

      // less button
      const lessNode = document.createElement("span");
      lessNode.innerHTML = " Less";
      lessNode.style.fontWeight = "bold";
      lessNode.style.float = "right";
      lessNode.style.cursor = "pointer";
      lessNode.style.marginTop = "16px";

      if (!collapsed) {
        // append more button to the last line of ellipsis
        spansOfLastLine[spansOfLastLine.length - 1].after(moreNode);
        moreNode.addEventListener("click", () => {
          try{
            logEvent(analytics, AnalyticsNames.buttons, {
                content_type: "show more",
                item_id: "show more", 
            })  
          }catch{}
          setCollapsed(true);
        });
        let run = true;
        let x = 2;
        while (run) {
          if (moreNode.getBoundingClientRect().y === heights[props.lines - 1]) {
            run = false;
            break;
          } else {
            spansOfLastLine[spansOfLastLine.length - x].after(moreNode);
            x += 1;
          }
        }
      } else {
        // append less button to last of paragraph
        spans[spans.length - 1].after(lessNode);
        lessNode.addEventListener("click", () => {
          try{
            logEvent(analytics, AnalyticsNames.buttons, {
                content_type: "show less",
                item_id: "show less", 
            })  
          }catch{}
          setCollapsed(false);
        });
      }
    }
  }, [children, hiddenTextRef, textRef, props.lines, collapsed]);

  return (
    <>
      <Typography
        {...restOfProps}
        ref={textRef}
        style={{
          position: "relative",
          height: collapsed ? "auto" : minHeight,
          overflow: "hidden",
        }}
      ></Typography>
      <Typography
        ref={hiddenTextRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          color: "transparent",
          userSelect: "none"
        }}
        component="p"
        dangerouslySetInnerHTML={{
          __html: `${Array.from({ length: props.lines || 2 }).map(
            () => "<br/>"
          )}`,
        }}
      ></Typography>
    </>
  );
};

export default Ellipsis;
