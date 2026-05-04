import { z } from 'zod'

export const contentPostSchema = z.object({
  title: z.string().min(3, 'Titre requis'),
  type: z.enum(['TOF', 'MOF', 'BOF']),
  status: z.enum(['idea', 'script', 'filming', 'editing', 'published']).default('idea'),
  script: z.string().optional(),
  publish_date: z.string().optional(),
  platform: z.enum(['instagram', 'tiktok']).default('instagram'),
})

export type ContentPostFormValues = z.infer<typeof contentPostSchema>
