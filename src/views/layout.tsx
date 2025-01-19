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
        <script src="https://unpkg.com/lucide@latest"></script>
        <script>
          {`
            document.addEventListener('DOMContentLoaded', function() {
              lucide.createIcons();
            });
          `}
        </script>
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
                    "secondary-weak": "#CBD5E1",
                    "secondary-border": "c9c9c9",
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
      <div className="min-h-screen flex flex-col items-center">
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
    <>
      <svg
        className="fixed inset-0 w-full h-full opacity-10"
        viewBox="0 0 1 1"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
      <div
        className="fixed inset-0 w-full h-full -z-10"
        style={{
          background: `
          linear-gradient(80deg, rgba(37,99,235,0.08), rgba(59,130,246,0.15))
        `,
          backgroundSize: "100% 100%",
          filter: "contrast(110%) brightness(120%)",
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent to-background opacity-90" />
    </>
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
    primary:
      "bg-primary border border-primary text-white hover:bg-accent hover:border-accent",
    secondary:
      "border border-secondary-border text-secondary bg-secondary/10 hover:bg-white/30",
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
