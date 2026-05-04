'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { updatePostStatus } from '@/app/(os)/content/actions'
import { toast } from 'sonner'

export type Post = {
  id: string
  title: string
  type: string
  status: string
  platform: string
  publish_date: string | null
  views: number | null
}

const KANBAN_STAGES = ['idea', 'script', 'filming', 'editing', 'published']

const STATUS_LABELS: Record<string, string> = {
  idea: 'Idée',
  script: 'Script',
  filming: 'Tournage',
  editing: 'Montage',
  published: 'Publié',
}

const TYPE_COLORS: Record<string, string> = {
  TOF: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  MOF: 'bg-green-500/10 text-green-500 border-green-500/20',
  BOF: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
}

export function KanbanBoard({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const newStatus = destination.droppableId

    // Optimistic UI update
    const previousPosts = [...posts]
    setPosts(posts.map(p => p.id === draggableId ? { ...p, status: newStatus } : p))

    // Update in backend
    try {
      const res = await updatePostStatus(draggableId, newStatus)
      if (!res.success) throw new Error(res.error)
      toast.success('Statut mis à jour')
    } catch (error) {
      setPosts(previousPosts)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-5 gap-3">
        {KANBAN_STAGES.map(stage => {
          const stagePosts = posts.filter(p => p.status === stage)

          return (
            <div key={stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {STATUS_LABELS[stage]}
                </span>
                <Badge variant="secondary" className="text-xs h-4">
                  {stagePosts.length}
                </Badge>
              </div>

              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[500px] space-y-2 rounded-md transition-colors ${
                      snapshot.isDraggingOver ? 'bg-muted/50' : ''
                    }`}
                  >
                    {stagePosts.map((post, index) => (
                      <Draggable key={post.id} draggableId={post.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <Link href={`/os/content/${post.id}`}>
                              <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                                <CardContent className="p-3 space-y-2">
                                  <p className="text-xs font-medium leading-tight">{post.title}</p>
                                  <div className="flex gap-1 flex-wrap">
                                    <Badge className={`${TYPE_COLORS[post.type] || 'bg-secondary text-foreground'} text-[10px] h-4`}>
                                      {post.type}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] h-4">
                                      {post.platform}
                                    </Badge>
                                  </div>
                                  {post.publish_date && (
                                    <p className="text-[10px] text-muted-foreground">{post.publish_date}</p>
                                  )}
                                </CardContent>
                              </Card>
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
