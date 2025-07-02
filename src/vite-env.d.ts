/// <reference types="vite/client" />

declare module '*.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.mdx' {
  let MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}
