import { z } from 'zod'

export const financeSchema = z.object({
  type: z.enum(['revenue', 'expense']),
  amount: z.number().positive('Montant doit être positif'),
  client_id: z.string().optional(),
  invoice_status: z.enum(['sent', 'paid', 'pending']).optional(),
  is_recurring: z.boolean().default(false),
  date: z.string(),
  description: z.string().min(1, 'Description requise'),
})

export type FinanceFormValues = z.infer<typeof financeSchema>
