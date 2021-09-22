// Global
import React, { useLayoutEffect, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { classnames } from '@/tailwindcss-classnames';
// Interfaces
import type { PageInfo } from '@/interfaces/page-info';
// Lib
import htmlConfig from '@/lib/html-constants';
const { idMainContent } = htmlConfig;
import { useGlobalState } from '@/lib/global-state';
// Components
import Hero from '@/components/heros/Hero';

// Suppress warnings when using useLayoutEffect.
// The usecase here has nothign to do with SSR and there is no "mismatch" since we're
// handling user agent focus only.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type LayoutProps = {
  pageInfo: PageInfo;
  children: React.ReactNode | React.ReactNode[];
};

const Layout = ({ pageInfo, children }: LayoutProps): JSX.Element => {
  const publicUrl = process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';
  const router = useRouter();
  const { asPath } = router;
  const path = asPath.split(/[?#]/)[0];
  const mainContentRef = useRef<HTMLAnchorElement>(null);

  const [navScrolled] = useGlobalState('navScrolled');

  // Set focus on the contain <main> element on route changes.
  useIsomorphicLayoutEffect(() => {
    let isMounted = false;

    router.events.on('routeChangeComplete', () => {
      if (!isMounted) {
        mainContentRef?.current?.focus();
      }
    });

    return () => {
      isMounted = true;
    };
  }, []);

  return (
    <div>
      <Head>
        <title>{pageInfo.title}</title>
        <link rel="icon" href={`${publicUrl}/favicon.png`} />
        {/* Preload our two most heavily used webfonts, reduce chance of FOUT */}
        <link
          rel="preload"
          href={`/fonts/AvenirNext-Regular--latin.woff2`}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href={`/fonts/AvenirNext-Bold--latin.woff2`}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/*
          Necessary Meta tags, including Social tags.
          It's OK if they're empty, same as not printing them.
        */}
        <meta property="description" content={pageInfo.description} />
        <meta property="og:site_name" content="Sitecore Development Portal" />
        <meta property="og:title" content={pageInfo.title} />
        <meta property="og:description" content={pageInfo.description} />
        <meta property="og:url" content={`${publicUrl}${path}`} />
        <meta
          property="og:image"
          content={`${publicUrl}${
            pageInfo.heroImage ? pageInfo.heroImage : '/images/social/social-card-default.jpeg'
          }`}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main className={classnames('mb-16', 'scroll-to-offset')}>
        {/* Anchor element at top of page to focus on route change. */}
        <a
          id={idMainContent}
          ref={mainContentRef}
          className={classnames('sr-only')}
          href="#"
          tabIndex={-1}
        >
          {pageInfo.title}
        </a>
        {/* a11y announcement for route changes. */}
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >{`The ${pageInfo.title} page has loaded.`}</div>
        <Hero
          title={pageInfo.title}
          description={pageInfo.description}
          image={pageInfo.heroImage}
        />
        {children}
      </main>
    </div>
  );
};

export default Layout;
