/* BASED ON https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-helmet/index.d.ts */
/* WAITING FOR https://github.com/nfl/react-helmet/issues/646 FIX */
declare module "react-helmet" {
  // Type definitions for react-helmet 6.1
  // Project: https://github.com/nfl/react-helmet
  // Definitions by: Evan Bremer <https://github.com/evanbb>
  //                 Isman Usoh <https://github.com/isman-usoh>
  //                 Yui T. <https://github.com/yuit>
  //                 Yamagishi Kazutoshi <https://github.com/ykzts>
  //                 Justin Hall <https://github.com/wKovacs64>
  //                 Andriy2 <https://github.com/Andriy2>
  //                 Piotr Błażejewicz <https://github.com/peterblazejewicz>
  // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

  import * as React from "react"

  interface OtherElementAttributes {
    [key: string]: string | number | boolean | null | undefined
  }

  type HtmlProps = JSX.IntrinsicElements["html"] & OtherElementAttributes

  type BodyProps = JSX.IntrinsicElements["body"] & OtherElementAttributes

  type LinkProps = JSX.IntrinsicElements["link"]

  type MetaProps = JSX.IntrinsicElements["meta"]

  export interface HelmetTags {
    baseTag: unknown[]
    linkTags: HTMLLinkElement[]
    metaTags: HTMLMetaElement[]
    noscriptTags: unknown[]
    scriptTags: HTMLScriptElement[]
    styleTags: HTMLStyleElement[]
  }

  export interface HelmetProps {
    async?: boolean | undefined
    base?: unknown
    bodyAttributes?: BodyProps | undefined
    children?: React.ReactNode
    defaultTitle?: string | undefined
    defer?: boolean | undefined
    encodeSpecialCharacters?: boolean | undefined
    htmlAttributes?: HtmlProps | undefined
    onChangeClientState?:
      | ((
          newState: unknown,
          addedTags: HelmetTags,
          removedTags: HelmetTags,
        ) => void)
      | undefined
    link?: LinkProps[] | undefined
    meta?: MetaProps[] | undefined
    noscript?: unknown[] | undefined
    script?: unknown[] | undefined
    style?: unknown[] | undefined
    title?: string | undefined
    titleAttributes?: object | undefined
    titleTemplate?: string | undefined
  }

  /**
   * Used by Helmet.peek()
   */
  export type HelmetPropsToState = HelmetTags &
    Pick<
      HelmetProps,
      | "bodyAttributes"
      | "defer"
      | "htmlAttributes"
      | "onChangeClientState"
      | "title"
      | "titleAttributes"
    > & {
      encode: Required<HelmetProps["encodeSpecialCharacters"]>
    }

  class Helmet extends React.Component<HelmetProps> {
    static peek(): HelmetPropsToState
    static rewind(): HelmetData
    static renderStatic(): HelmetData
    static canUseDOM: boolean
  }

  const HelmetExport: typeof Helmet

  export { HelmetExport as Helmet }
  export default HelmetExport

  export interface HelmetData {
    base: HelmetDatum
    bodyAttributes: HelmetHTMLBodyDatum
    htmlAttributes: HelmetHTMLElementDatum
    link: HelmetDatum
    meta: HelmetDatum
    noscript: HelmetDatum
    script: HelmetDatum
    style: HelmetDatum
    title: HelmetDatum
    titleAttributes: HelmetDatum
  }

  export interface HelmetDatum {
    toString(): string
    toComponent(): React.ReactElement
  }

  export interface HelmetHTMLBodyDatum {
    toString(): string
    toComponent(): React.HTMLAttributes<HTMLBodyElement>
  }

  export interface HelmetHTMLElementDatum {
    toString(): string
    toComponent(): React.HTMLAttributes<HTMLHtmlElement>
  }

  export const canUseDOM: boolean
}
