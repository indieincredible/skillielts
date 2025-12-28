'use client';
import Link, { LinkProps } from 'next/link';
import NProgress from 'nprogress';

function getTargetPath(props: LinkProps) {
  if (typeof props.href === 'string') {
    return props.href;
  } else if (typeof props.href === 'object' && props.href.pathname) {
    if (props.href.query && Object.keys(props.href.query).length > 0) {
      const params = new URLSearchParams(props.href.query as Record<string, string>).toString();
      return props.href.pathname + '?' + params;
    }
    return props.href.pathname;
  }
  return '';
}

export default function ProgressLink(props: LinkProps & { children: React.ReactNode }) {
  return (
    <Link
      {...props}
      onClick={e => {
        const currentPath = window.location.pathname + window.location.search;
        const targetPath = getTargetPath(props);
        if (targetPath !== currentPath) {
          NProgress.start();
        } else {
          NProgress.done();
        }
        if (typeof props.onClick === 'function') props.onClick(e);
      }}
    >
      {props.children}
    </Link>
  );
}






