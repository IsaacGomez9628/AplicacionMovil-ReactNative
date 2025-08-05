/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/Login` | `/Login`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/Register` | `/Register`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/Welcome` | `/Welcome`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/Login` | `/Login`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/Register` | `/Register`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/Welcome` | `/Welcome`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/Login${`?${string}` | `#${string}` | ''}` | `/Login${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/Register${`?${string}` | `#${string}` | ''}` | `/Register${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/Welcome${`?${string}` | `#${string}` | ''}` | `/Welcome${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/Login` | `/Login`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/Register` | `/Register`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/Welcome` | `/Welcome`; params?: Router.UnknownInputParams; };
    }
  }
}
