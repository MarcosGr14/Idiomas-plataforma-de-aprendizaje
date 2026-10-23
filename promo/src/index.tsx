import React from "react";
import { Composition, registerRoot } from "remotion";
import { Promo } from "./Promo";
const Root = () => (
  <>
    {[
      ["PromoLandscape", 1920, 1080, false],
      ["PromoVertical", 1080, 1920, true],
      ["PreviewLandscape", 854, 480, false],
      ["PreviewVertical", 270, 480, true],
    ].map(([id, width, height, vertical]) => (
      <Composition
        key={String(id)}
        id={String(id)}
        component={Promo}
        durationInFrames={1200}
        fps={30}
        width={Number(width)}
        height={Number(height)}
        defaultProps={{ vertical: Boolean(vertical), publicUrl: "" }}
      />
    ))}
  </>
);
registerRoot(Root);
