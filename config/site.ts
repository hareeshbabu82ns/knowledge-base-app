export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "HKBase",
  description: "Knowledge Base",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Files",
      href: "/files",
    },
    {
      title: "Settings",
      href: "/settings",
    },
  ],
  links: {
    twitter: "https://twitter.com/hpolla",
    github: "https://github.com/hareeshbabu82ns/hexplorer",
    docs: "https://kbase.local.terabits.io/",
  },
};
