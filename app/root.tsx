import { LinksFunction, json } from "@remix-run/node";
import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import {
  BiSortAlt2,
  BiLinkExternal,
  BiCalendar,
  BiDownArrowAlt,
  BiUpArrowAlt,
} from "react-icons/bi"; // Added BiLinkExternal icon
import stylesheet from "./globals.css";
import { useRef, useState, forwardRef, ForwardedRef } from "react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
