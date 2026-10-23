import React from "react";
import { brand } from "../../design/tokens";
import { notoFaces } from "../../design/fonts";
export function brandCSS(fontRoot = "/fonts", calligraphy = false) {
  const variables = Object.entries(brand.colors)
    .map(([key, value]) => `--${key}:${value}`)
    .join(";");
  return `:root{${variables};--font-body:'${brand.fonts.body}';--font-japanese:'${brand.fonts.japanese}';--font-calligraphy:'${brand.fonts.calligraphy}'}\n@font-face{font-family:'${brand.fonts.body}';src:url('${fontRoot}/manrope.woff2') format('woff2');font-weight:200 800;font-display:block}\n${notoFaces.replaceAll("/fonts/", fontRoot + "/")}\n${calligraphy ? `@font-face{font-family:'${brand.fonts.calligraphy}';src:url('${fontRoot}/yuji-boku-intro.woff2') format('woff2');font-display:block}` : ""}`;
}
export function BrandStyles({
  fontRoot = "/fonts",
  calligraphy = false,
}: {
  fontRoot?: string;
  calligraphy?: boolean;
}) {
  return <style>{brandCSS(fontRoot, calligraphy)}</style>;
}

export function BrandSeal({
  size = 36,
  style = {},
}: {
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      lang="ja"
      aria-label="Idiomas"
      style={{
        display: "inline-block",
        fontFamily: brand.fonts.japanese,
        fontSize: size,
        fontWeight: 600,
        lineHeight: 1,
        color: brand.colors.red,
        ...style,
      }}
    >
      文
    </span>
  );
}
