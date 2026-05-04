'use client'

import React, { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Post } from './kanban-board'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function CalendarView({ posts }: { posts: Post[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Posts with a publish_date
  const scheduledPosts = posts.filter(p => p.publish_date !== null)
  
  // Find posts for the selected date
  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : null
  const postsOnSelectedDate = scheduledPosts.filter(p => p.publish_date === selectedDateStr)

  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-6">
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={fr}
            className="rounded-md border shadow"
            modifiers={{
              hasPost: scheduledPosts.map(p => new Date(p.publish_date!))
            }}
            modifiersStyles={{
              hasPost: { fontWeight: 'bold', textDecoration: 'underline', color: 'var(--primary)' }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-sm">
            {date ? format(date, 'd MMMM yyyy', { locale: fr }) : 'Sélectionnez une date'}
          </h3>
          
          {postsOnSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {postsOnSelectedDate.map(post => (
                <Link key={post.id} href={`/os/content/${post.id}`}>
                  <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                    <CardContent className="p-3 space-y-2">
                      <p className="text-xs font-medium leading-tight">{post.title}</p>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] h-4">
                          {post.platform}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Aucun post prévu à cette date.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
