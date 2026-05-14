import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  mainSidebar: [
    "intro",
    {
      type: "category",
      label: "Protocol",
      collapsed: false,
      items: [
        "protocol/overview",
        "protocol/identifiers",
        "protocol/dns-records",
        "protocol/challenge-code",
        "protocol/service-provider",
        "protocol/cryptography",
      ],
    },
    {
      type: "category",
      label: "OAuth Integration",
      collapsed: false,
      items: [
        "oauth/overview",
        "oauth/authorization-flow",
        "oauth/token-endpoint",
        "oauth/userinfo",
        "oauth/scopes",
        "oauth/validation-data",
      ],
    },
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: ["guides/signup", "guides/login", "guides/integrate-oauth"],
    },
    {
      type: "category",
      label: "Reference",
      collapsed: true,
      items: ["reference/dns-records", "reference/oauth-parameters"],
    },
  ],
};

export default sidebars;
