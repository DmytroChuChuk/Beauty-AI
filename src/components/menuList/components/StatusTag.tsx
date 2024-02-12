import { FC } from "react";
import shallow from "zustand/shallow";
import { PremiumIcon } from "../../../icons/materialUiSvg";
import { useUser } from "../../../store";
import "./scss/StatusTag.scss";

const StatusTag: FC = () => {
  const [uid, isAdmin, isPremium] = useUser(
    (state) => [
      state.currentUser?.uid,
      state.currentUser?.isAdmin,
      state.currentUser?.isPremium,
    ],
    shallow
  );

  return (
    <div className="status-tag">
      {uid ? (
        <>
          {isAdmin === undefined ? (
            isPremium ? (
              <PremiumIcon />
            ) : (
              <></>
            )
          ) : (
            <>
              {isAdmin === false ? (
                <p style={{ backgroundColor: "red", color: "white" }}>
                  In review
                </p>
              ) : (
                <p
                  style={{
                    backgroundColor: "#F3EEBC",
                  }}
                >
                  Babe
                </p>
              )}
            </>
          )}
        </>
      ) : null}
    </div>
  );
};

export default StatusTag;
