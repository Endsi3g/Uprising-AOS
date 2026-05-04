import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  type: z.enum(['pro_bono', 'paid']),
  status: z.enum(['active', 'archived']).default('active'),
  services: z.array(z.string()).min(1, 'Au moins un service requis'),
  contract_url: z.string().url().optional().or(z.literal('')),
})

export type ClientFormValues = z.infer<typeof clientSchema>
