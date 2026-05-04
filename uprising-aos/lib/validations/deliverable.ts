import { z } from 'zod'

export const deliverableSchema = z.object({
  client_id: z.string().min(1, 'Client requis'),
  title: z.string().min(3, 'Titre requis'),
  status: z.enum(['pending', 'in_progress', 'review', 'completed']).default('pending'),
  progress: z.number().min(0).max(100).default(0),
  assigned_to: z.string().min(1, 'Assigné requis'),
  deadline: z.string(),
})

export type DeliverableFormValues = z.infer<typeof deliverableSchema>
