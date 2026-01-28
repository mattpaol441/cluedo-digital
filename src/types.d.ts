declare module 'koa2-connect-history-api-fallback' {
  import { Middleware } from 'koa';
  
  interface Options {
    index?: string;
    whiteList?: string[];
    verbose?: boolean;
    htmlAcceptHeaders?: string[];
    disableDotRule?: boolean;
    rewrites?: Array<{
      from: RegExp;
      to: string | ((context: any) => string);
    }>;
  }

  export function historyApiFallback(options?: Options): Middleware;
}