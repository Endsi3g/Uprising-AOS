import { z } from 'zod'

export const leadSchema = z.object({
  company: z.string().min(1, 'Entreprise requise'),
  city: z.string().min(1, 'Ville requise'),
  email: z.string().email('Email invalide'),
  website: z.string().url().optional().or(z.literal('')),
  site_quality: z.enum(['outdated', 'ok', 'none']),
  status: z.enum(['cold', 'email_1', 'email_2', 'email_3', 'replied', 'call']).default('cold'),
  is_premium: z.boolean().default(false),
})

export type LeadFormValues = z.infer<typeof leadSchema>
