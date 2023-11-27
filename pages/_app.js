import Router from "next/router";
import Head from "next/head";
import nProgress from "nprogress";

import "@/styles/nprogress.css";
import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
if (typeof document !== "undefined") {
  require("bootstrap/dist/js/bootstrap.bundle.min.js");
}
import "bootstrap-icons/font/bootstrap-icons.css";

Router.events.on("routeChangeStart", (url) => {
  nProgress.start();
});

Router.events.on("routeChangeComplete", () => {
  nProgress.done();
});

Router.events.on("routeChangeError", () => {
  nProgress.done();
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Projeto Sacha</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
