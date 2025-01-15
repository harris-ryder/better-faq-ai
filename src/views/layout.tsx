import React from "preact/compat";

export const Layout: React.FC<{
  children: React.ReactNode;
  header?: React.ReactNode;
}> = ({ children, header = <Header /> }) => {
  return (
    <>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Better Faqs AI</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/images/question-logo.svg"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontSize: {
                    xs: "12px",
                  },
                  colors: {
                    primary: "#2463EB",
                    accent: "#2E81FD",
                    foreground:  "#0F172A",
                    "foreground-weak":  "#334155",
                    secondary: "#666",
                    border: "#E7E7E9",
                    "primary-light": "#e9f0fe",
                    "gray-light": "#efefef",
                    background: "#f5f5f5",
                    error: "#cf303b",
                  },
                  fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                  },
                },
              },
            };
          `,
          }}
        />
      </head>
      <Background />
      <div className="min-h-screen flex flex-col">
        {header}
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  );
};

export const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 flex justify-center border-b border-border relative">
      <div className="max-w-7xl w-full flex justify-between">
        <div className="flex gap-2 items-center text-xl font-semibold text-primary">
          <img
            src="/images/question-logo.svg"
            alt="Question Logo"
            className="h-8 w-8"
          />
          Better Faqs AI
        </div>
        <div className="flex gap-8 text-sm text-foreground items-center">
          <a className="hover:text-primary cursor-pointer">Docs</a>
          <a className="hover:text-primary cursor-pointer">Blog</a>
          <a className="hover:text-primary cursor-pointer">Showcase</a>
          <div className="border-l border-border h-full py-1"></div>
          <Button>Try now</Button>
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return <footer className="w-full py-4 px-6 text-white mt-auto"></footer>;
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export const Background: React.FC = () => {
  return (
    <svg
      preserveAspectRatio="none"
      width="650"
      height="500"
      className="w-full h-full fixed inset-0"
    >
      <filter id="roughpaper" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence baseFrequency="0.04" result="noise" />

        <feDiffuseLighting in="noise" lighting-color="white" surfaceScale="2">
          <feDistantLight azimuth="45" elevation="60" />
        </feDiffuseLighting>
      </filter>

      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        filter="url(#roughpaper)"
        fill="none"
        opacity="0.15"
      />
    </svg>
  );
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "rounded-lg px-6 py-2 font-medium text-sm transition-colors";
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-accent",
    secondary: "border border-border text-secondary hover:bg-gray-50",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
