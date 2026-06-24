import { defineConfig } from '@prisma/config'

export default defineConfig({
  earlyAccess: true,
  migrate: {
    schema: './prisma/schema.prisma',
    database: {
      url: process.env.DATABASE_URL,
    },
  },
})
