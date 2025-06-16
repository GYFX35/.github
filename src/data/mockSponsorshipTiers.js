// src/data/mockSponsorshipTiers.js
export const mockSponsorshipTiers = [
  {
    id: "tier_gold",
    name: "Gold Sponsor",
    pricePerMonth: 299,
    priceAnnual: 2999,
    currency: "USD",
    benefits: [
      "Prominent logo placement on homepage and all article pages.",
      "One dedicated sponsored article per quarter.",
      "Mention in our monthly newsletter.",
      "Social media shout-out twice a month."
    ],
    description: "Maximum visibility and engagement with our audience. Ideal for established brands looking for significant impact.",
    cta: "Become a Gold Sponsor"
  },
  {
    id: "tier_silver",
    name: "Silver Sponsor",
    pricePerMonth: 149,
    priceAnnual: 1499,
    currency: "USD",
    benefits: [
      "Logo placement on our dedicated sponsors page.",
      "One sponsored article per year.",
      "Mention in our monthly newsletter (standard listing)."
    ],
    description: "Great value for growing brands looking to connect with our readers.",
    cta: "Become a Silver Sponsor"
  },
  {
    id: "tier_bronze",
    name: "Bronze Supporter",
    pricePerMonth: 49,
    priceAnnual: 499,
    currency: "USD",
    benefits: [
      "Name listing on our dedicated sponsors page.",
      "A thank you mention in one newsletter."
    ],
    description: "Support our magazine and get recognized by our community. Perfect for individuals and small businesses.",
    cta: "Become a Bronze Supporter"
  }
];
