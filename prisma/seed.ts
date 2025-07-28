import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create categories
  console.log("📁 Creating categories...")
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "cat-1" },
      update: {},
      create: {
        id: "cat-1",
        name: "Technical Issue",
        description: "Problems with functionality or bugs",
        color: "#EF4444",
        experienceId: "exp_1crh8cW7UPLwlU",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-2" },
      update: {},
      create: {
        id: "cat-2",
        name: "Account Support",
        description: "Account-related questions and issues",
        color: "#3B82F6",
        experienceId: "exp_1crh8cW7UPLwlU",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-3" },
      update: {},
      create: {
        id: "cat-3",
        name: "Billing",
        description: "Payment and subscription inquiries",
        color: "#10B981",
        experienceId: "exp_1crh8cW7UPLwlU",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-4" },
      update: {},
      create: {
        id: "cat-4",
        name: "Feature Request",
        description: "Suggestions for new features",
        color: "#8B5CF6",
        experienceId: "exp_1crh8cW7UPLwlU",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-5" },
      update: {},
      create: {
        id: "cat-5",
        name: "General Question",
        description: "General inquiries and questions",
        color: "#6B7280",
        experienceId: "exp_1crh8cW7UPLwlU",
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Create settings for creator (using external user IDs from Whop)
  console.log("⚙️ Creating settings...")
  await prisma.settings.upsert({
    where: { 
      experienceId_userId: {
        experienceId: "exp_1crh8cW7UPLwlU",
        userId: "whop-user-creator-1"
      }
    },
    update: {},
    create: {
      experienceId: "exp_1crh8cW7UPLwlU",
      userId: "whop-user-creator-1",
      agentName: "Support Team",
      welcomeMessage: "Welcome to our support! How can we help you today?",
      autoMessage: "Thank you for your message. We'll get back to you shortly.",
      reminderMessage: "Hi! Just checking in on your support ticket. Do you need any additional help?",
      reminderEnabled: true,
      reminderHours: 12,
    },
  })

  console.log("✅ Created settings")

  // Create sample tickets (using external user IDs from Whop)
  console.log("🎫 Creating tickets...")
  const ticket1 = await prisma.ticket.upsert({
    where: { id: "ticket-1" },
    update: {},
          create: {
        id: "ticket-1",
        experienceId: "exp_1crh8cW7UPLwlU",
        title: "Login Issues",
      description: "I cannot log into my account",
      status: "OPEN",
      priority: "HIGH",
      creatorId: "whop-user-customer-1",
      categoryId: "cat-2",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  })

  const ticket2 = await prisma.ticket.upsert({
    where: { id: "ticket-2" },
    update: {},
          create: {
        id: "ticket-2",
        experienceId: "exp_1crh8cW7UPLwlU",
        title: "Payment Failed",
      description: "My payment was declined but I was charged",
      status: "CLAIMED",
      priority: "URGENT",
      creatorId: "whop-user-customer-2",
      categoryId: "cat-3",
      agentId: "whop-user-creator-1",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      claimedAt: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
    },
  })

  const ticket3 = await prisma.ticket.upsert({
    where: { id: "ticket-3" },
    update: {},
          create: {
        id: "ticket-3",
        experienceId: "exp_1crh8cW7UPLwlU",
        title: "Feature Request",
      description: "Can you add dark mode?",
      status: "CLOSED",
      priority: "LOW",
      creatorId: "whop-user-customer-1",
      categoryId: "cat-4",
      agentId: "whop-user-creator-1",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      claimedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      closedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  })

  console.log("✅ Created tickets")

  // Create sample messages (using external user IDs from Whop)
  console.log("💬 Creating messages...")
  await Promise.all([
    prisma.message.upsert({
      where: { id: "msg-1" },
      update: {},
      create: {
        id: "msg-1",
        content: "I cannot log into my account. I keep getting an error message.",
        ticketId: "ticket-1",
        senderId: "whop-user-customer-1",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.message.upsert({
      where: { id: "msg-2" },
      update: {},
      create: {
        id: "msg-2",
        content: "My payment was declined but I was charged on my credit card.",
        ticketId: "ticket-2",
        senderId: "whop-user-customer-2",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
    prisma.message.upsert({
      where: { id: "msg-3" },
      update: {},
      create: {
        id: "msg-3",
        content: "I'll look into this right away. Can you provide your transaction ID?",
        ticketId: "ticket-2",
        senderId: "whop-user-creator-1",
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      },
    }),
    prisma.message.upsert({
      where: { id: "msg-4" },
      update: {},
      create: {
        id: "msg-4",
        content: "Can you add dark mode? It would be really helpful for night usage.",
        ticketId: "ticket-3",
        senderId: "whop-user-customer-1",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.message.upsert({
      where: { id: "msg-5" },
      update: {},
      create: {
        id: "msg-5",
        content: "Great suggestion! We'll add this to our roadmap and implement it soon.",
        ticketId: "ticket-3",
        senderId: "whop-user-creator-1",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.message.upsert({
      where: { id: "msg-6" },
      update: {},
      create: {
        id: "msg-6",
        content: "Perfect! Dark mode has been implemented. You can find the toggle in the header.",
        ticketId: "ticket-3",
        senderId: "whop-user-creator-1",
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      },
    }),
  ])

  console.log("✅ Created messages")

  // Create sample review (using external user IDs from Whop)
  console.log("⭐ Creating reviews...")
  await prisma.review.upsert({
    where: { ticketId: "ticket-3" },
    update: {},
    create: {
      rating: 5,
      feedback: "Great support! Very helpful and quick response. The dark mode looks amazing!",
      ticketId: "ticket-3",
      userId: "whop-user-customer-1",
      experienceId: "exp_1crh8cW7UPLwlU",
      createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    },
  })

  console.log("✅ Created reviews")

  console.log("🎉 Database seeded successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
