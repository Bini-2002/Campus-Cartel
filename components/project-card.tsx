import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageSquare, Share2 } from "lucide-react"

interface ProjectCardProps {
  title: string
  description: string
  image: string
  tags: string[]
  likes: number
}

export default function ProjectCard({ title, description, image, tags, likes }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video w-full overflow-hidden">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
      </div>
      <CardHeader className="p-4 pb-0">
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
            <Heart className="h-4 w-4 mr-1" /> {likes}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <MessageSquare className="h-4 w-4 mr-1" /> 8
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-500">
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
