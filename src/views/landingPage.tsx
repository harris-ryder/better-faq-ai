import { Button, Layout } from "./layout";
import React from "preact/compat";

export const LandingPage = () => {
  return (
    <Layout header={<Header />}>
      <div className="flex flex-col items-center justify-center gap-8 py-16 relative">
        <div className="max-w-[60rem] pt-16 flex flex-col gap-6 justify-center items-center">
          <h1 className="text-6xl font-bold text-center text-foreground">
            Automate building FAQ's with Artificial Intelligence.
          </h1>

          <div className="max-w-2xl text-center text-gray-600">
            <p className="mb-4">
              A webflow app that reads and understands your website to generate
              the most relevant Frequently Asked Questions and answers.
            </p>
          </div>

          <div className="flex gap-4">
            <Button variant="primary">Get Started</Button>
            <Button variant="secondary">Learn More</Button>
          </div>
        </div>
        <div className="flex gap-12 px-6 pt-12 items-center">
          <AnimatedFaqList />
          <AnimatedTwoWayArrow />
          <img
            src="/images/example-page.png"
            className="w-[40rem] aspect-auto"
          />
        </div>
        <FounderMessageSection className="max-w-[1240px] flex flex-col gap-8 justify-center items-center py-24" />
        <TestimonialsSection className="max-w-[1240px] justify-center pb-24" />
        <SeamlessIntegrationSection />
        <FullControlSection />
      </div>
    </Layout>
  );
};

export const AnimatedTwoWayArrow: React.FC = () => {
  return (
    <>
      <svg className="hidden">
        <defs>
          <filter id="squiggly-0">
            <feTurbulence
              baseFrequency="0.02"
              numOctaves="3"
              result="noise"
              seed="0"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
          </filter>
          <filter id="squiggly-1">
            <feTurbulence
              baseFrequency="0.02"
              numOctaves="3"
              result="noise"
              seed="1"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" />
          </filter>
        </defs>
      </svg>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes squiggly-anim {
              0% { filter: url('#squiggly-0'); }
              50% { filter: url('#squiggly-1'); }
              100% { filter: url('#squiggly-0'); }
            }
            .squiggly {
              animation: squiggly-anim 0.34s linear infinite;
            }
          `,
        }}
      />
      <img
        src="/images/two-way-arrows.svg"
        className="h-16 w-16 rotate-90 squiggly"
      />
    </>
  );
};

export const AnimatedFaqList: React.FC = () => {
  return (
    <div className="w-[24rem] h-[24rem] border border-secondary-border rounded-xl overflow-y-auto flex flex-col gap-2 p-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .fade-in {
            opacity: 0;
            animation: fadeIn 0.3s ease-in forwards;
          }
        `,
        }}
      />
      {[
        "How do I get started?",
        "What is Better Faqs AI?",
        "How much does it cost?",
        "Can I customize the FAQs?",
        "Do you support multiple languages?",
        "How accurate are the generated answers?",
        "Can I edit the generated FAQs?",
        "What websites do you support?",
        "How long does it take to generate FAQs?",
        "Is there a limit to the number of FAQs?",
      ].map((question, index) => (
        <div
          key={question}
          className="bg-background/50 border border-secondary-border text-foreground-weak rounded-lg p-2 flex justify-between items-center fade-in"
          style={{ animationDelay: `${index * 0.3}s` }}
        >
          {question}
          <span className="text-foreground-weak">+</span>
        </div>
      ))}
    </div>
  );
};

export const Header: React.FC = () => {
  return (
    <header className="w-full mt-2 py-4 px-6 flex justify-center relative">
      <div className="w-full flex justify-between">
        <div className="flex gap-2 items-center text-xl font-semibold text-foreground">
          <img
            src="/images/question-logo.svg"
            alt="Question Logo"
            className="h-8 w-8"
          />
          Better Faqs AI
        </div>
        <div className="flex gap-8 text-sm font-semibold text-foreground-weak items-center">
          <a className="hover:text-accent cursor-pointer">Docs</a>
          <a className="hover:text-accent cursor-pointer">Blog</a>
          <a className="hover:text-accent cursor-pointer">Showcase</a>
          <div className="border-l border-foreground-weak h-[90%] py-1"></div>
          <Button>Try now</Button>
        </div>
      </div>
    </header>
  );
};

export const FounderMessageSection: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={className}>
      <h1 className="text-4xl font-bold text-center text-foreground">
        Speed up development.
      </h1>
      <div className="max-w-3xl text-center text-gray-600">
        <p>
          BetterFaqAI is a Webflow app that analyzes your website to generate
          relevant Frequently Asked Questions (FAQs) and answers. Crafting FAQs
          is essential but often time-consuming for businesses. By leveraging
          AI, BetterFaqAI streamlines this process, delivering fast, accurate
          results that integrate directly into your Webflow CMS.
        </p>
      </div>
      <div className="flex gap-4">
        <img
          src="https://api.dicebear.com/9.x/notionists/svg?seed=Midnight"
          className="rounded-full w-14 h-14 border border-foreground-weak"
        />
        <div className="flex flex-col gap-0 text-foreground justify-center items-left">
          <div className="font-bold text-foreground">Florian Herrengt</div>
          <div className="text-foreground-weak text-xs">
            Creator of BetterFaqAI
          </div>
        </div>
      </div>
    </div>
  );
};

export const TestimonialsSection: React.FC<{ className?: string }> = ({
  className,
}) => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director at TechFlow",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Sarah",
      text: "BetterFaqAI has transformed how we handle customer questions. The AI-generated FAQs are surprisingly accurate and saved our team countless hours of work. The Webflow integration is seamless!",
    },
    {
      name: "Marcus Rodriguez",
      role: "Founder of DigitalFirst",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Marcus",
      text: "I was skeptical about AI-generated FAQs, but the quality exceeded my expectations. It picked up on nuances in our content that I wouldn't have thought to address. Definitely worth the investment.",
    },
    {
      name: "Emma Thompson",
      role: "Product Manager at CloudScale",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Emma",
      text: "The speed and accuracy of BetterFaqAI is impressive. We updated our entire product line's FAQs in minutes instead of days. The AI understands context really well and generates relevant questions our customers actually ask.",
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-transparent">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className="flex flex-col gap-4 justify-left bg-background/20 rounded-xl p-6 border border-secondary-border"
          >
            <div className="flex gap-4">
              <img
                src={testimonial.avatar}
                className="rounded-full w-14 h-14 border border-foreground"
              />
              <div className="flex flex-col gap-0 text-foreground justify-center items-left">
                <div className="font-bold text-foreground">
                  {testimonial.name}
                </div>
                <div className="text-foreground-weak text-xs">
                  {testimonial.role}
                </div>
              </div>
            </div>
            <p className="text-gray-600">{testimonial.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SeamlessIntegrationSection: React.FC = () => {
  return (
    <div className="w-[1240px] flex flex-col gap-8 justify-start items-start">
      <div className="max-w-3xl text-left flex flex-col items-left text-gray-600 gap-9">
        <div className="flex justify-center items-center rounded-md full border border-2 border-primary w-12 h-12">
          <i data-lucide="pencil-ruler" className="w-8 h-8 text-primary"></i>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-primary font-bold">Seamless</p>
          <h1 className="text-4xl font-bold text-foreground">
            A seamless integration.
          </h1>
          <p className="text-secondary">
            No steps or configuaration needed, we read your website and give you
            an a list of FAQ's instantly, saved directly to your website. You
            can edit the messages via our page or directly in webflow.
          </p>
        </div>
        <Button variant="primary" className="w-fit !px-4">
          Learn More
        </Button>
        <div className="flex gap-12 justify-start">
          <div className="flex flex-col gap-4 items-center">
            <i
              data-lucide="zap"
              className="w-8 h-8 text-secondary-border"
              stroke-width="1.5"
            ></i>
            <p className="text-secondary-border text-sm font-medium">Fast</p>
          </div>
          <div className="flex flex-col gap-4 items-center">
            <i
              data-lucide="puzzle"
              className="w-8 h-8 text-secondary-border"
              stroke-width="1.5"
            ></i>
            <p className="text-secondary-border text-sm font-medium">
              Seamless
            </p>
          </div>
          <div className="flex flex-col gap-4 items-center">
            <i
              data-lucide="target"
              className="w-8 h-8 text-secondary-border"
              stroke-width="1.5"
            ></i>
            <p className="text-secondary-border text-sm font-medium">
              Relevant
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]">
        <div className="absolute inset-0 top-[2rem] -z-10">
          <div className="w-full h-full bg-[linear-gradient(90deg,theme(colors.secondary-weak)_1px,transparent_0),linear-gradient(theme(colors.secondary-weak)_1px,transparent_0)] bg-[size:24px_24px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent " />
        </div>

        <img
          src="/images/webflow-cms.png"
          alt="Landing illustration"
          className="w-1/2 h-auto mx-auto z-20"
        />
      </div>
    </div>
  );
};

const FullControlSection: React.FC = () => {
  return (
    <div className="mt-24 w-[1240px] flex flex-col gap-8 justify-start items-start">
      <div className="max-w-3xl text-left flex flex-col items-left text-gray-600 gap-9">
        <div className="flex justify-center items-center rounded-md full border border-2 border-primary w-12 h-12">
          <i
            data-lucide="sliders-horizontal"
            className="w-8 h-8 text-primary"
          ></i>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-primary font-bold">Control</p>
          <h1 className="text-4xl font-bold text-foreground">Full Control.</h1>
          <p className="text-secondary">
            All the data is yours and sent straight to your Webflow cms, we
            store none of it! You can select and remove the generated FAQs on
            our website or directly in your Webflow editor
          </p>
        </div>
        <Button variant="primary" className="w-fit !px-4">
          Learn More
        </Button>
        <div className="flex gap-12 justify-start">
          <div className="flex flex-col gap-4 items-center">
            <i
              data-lucide="zap"
              className="w-8 h-8 text-secondary-border"
              stroke-width="1.5"
            ></i>
            <p className="text-secondary-border text-sm font-medium">Fast</p>
          </div>
          <div className="flex flex-col gap-4 items-center">
            <i
              data-lucide="puzzle"
              className="w-8 h-8 text-secondary-border"
              stroke-width="1.5"
            ></i>
            <p className="text-secondary-border text-sm font-medium">
              Seamless
            </p>
          </div>
          <div className="flex flex-col gap-4 items-center">
            <i
              data-lucide="target"
              className="w-8 h-8 text-secondary-border"
              stroke-width="1.5"
            ></i>
            <p className="text-secondary-border text-sm font-medium">
              Relevant
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]">
        <div className="absolute inset-0 top-[2rem] -z-10">
          <div className="w-full h-full bg-[linear-gradient(90deg,theme(colors.secondary-weak)_1px,transparent_0),linear-gradient(theme(colors.secondary-weak)_1px,transparent_0)] bg-[size:24px_24px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent " />
        </div>

        <img
          src="images/landing_img_1.png"
          alt="Landing illustration"
          className="w-1/3 h-auto mx-auto z-20"
        />
      </div>
    </div>
  );
};
