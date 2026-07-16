import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { OFFERINGS } from "@signalwork/shared";

const prisma = new PrismaClient();

function offeringField(id) {
  const offering = OFFERINGS.find((o) => o.id === id);
  return JSON.stringify(offering ? [{ ...offering, custom: false }] : []);
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "demo@signalwork.io" },
    update: {},
    create: { email: "demo@signalwork.io", passwordHash },
  });

  const leads = [
    {
      company: "Northfield Manufacturing Co.",
      contact: "Dana Ruiz",
      designation: "VP of Operations",
      email: "dana.ruiz@northfieldmfg.example.com",
      industry: "Manufacturing",
      source: "Job posting",
      sourceUrl: "https://example.com/jobs/northfield-reliability-engineer",
      signals: JSON.stringify(["Posted a plant reliability engineer role"]),
      tier: "A",
      status: "Contacted",
      offering: offeringField("predictive-maintenance"),
      contacts: {
        create: [
          { role: "Recruiter", name: "Priya Nair", email: "priya.nair@northfieldmfg.example.com", sortOrder: 0 },
          { role: "Decision maker", name: "Dana Ruiz", designation: "VP of Operations", sortOrder: 1 },
        ],
      },
    },
    {
      company: "Meridian Trust Bank",
      contact: "Alan Cho",
      designation: "Chief Risk Officer",
      industry: "BFSI",
      source: "News announcement",
      sourceUrl: "https://example.com/news/meridian-digital-lending",
      signals: JSON.stringify(["Announced digital lending transformation initiative"]),
      tier: "A",
      status: "Meeting Booked",
      offering: offeringField("risk-underwriting"),
      contacts: {
        create: [
          { role: "HR / Talent", name: "Grace Lin", sortOrder: 0 },
          { role: "Executive (CEO/Founder)", name: "Alan Cho", designation: "Chief Risk Officer", sortOrder: 1 },
        ],
      },
    },
    {
      company: "Delta Valley Utilities",
      contact: "Marcus Webb",
      designation: "Director of Grid Operations",
      industry: "Utilities",
      source: "LinkedIn post",
      signals: JSON.stringify(["Hiring for outage response automation"]),
      tier: "B",
      status: "Researched",
      offering: offeringField("grid-ops-copilot"),
    },
    {
      company: "Ironclad Sports Group",
      contact: "Jamie Ortiz",
      designation: "VP of Fan Engagement",
      industry: "Sports",
      source: "AI scout",
      signals: JSON.stringify(["Season ticket renewal rates declining"]),
      tier: "C",
      status: "Researched",
      offering: offeringField("fan-engagement-ai"),
    },
  ];

  for (const lead of leads) {
    await prisma.lead.create({ data: lead });
  }

  console.log("Seed complete. Demo login: demo@signalwork.io / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
