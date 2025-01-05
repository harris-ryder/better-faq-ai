import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout = ({ children, title = "My App" }: LayoutProps) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      <link href="/output.css" rel="stylesheet" />
    </head>
    <body>{children}</body>
  </html>
);
