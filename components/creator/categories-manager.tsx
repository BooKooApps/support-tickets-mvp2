"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  description: string
  color: string
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      })

      if (response.ok) {
        const category = await response.json()
        setCategories((prev) => [...prev, category])
        setNewCategory({ name: "", description: "", color: "#3B82F6" })
        toast({
          title: "Category created",
          description: "New category has been added successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCategories((prev) => prev.filter((cat) => cat.id !== id))
        toast({
          title: "Category deleted",
          description: "Category has been removed successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Categories */}
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                <div>
                  <div className="font-medium">{category.name}</div>
                  {category.description && <div className="text-sm text-muted-foreground">{category.description}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditingCategory(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Category */}
        <form onSubmit={handleCreateCategory} className="space-y-4 border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4" />
            <span className="font-medium">Add New Category</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Name</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryColor">Color</Label>
              <Input
                id="categoryColor"
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, color: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryDescription">Description (Optional)</Label>
            <Input
              id="categoryDescription"
              value={newCategory.description}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description"
            />
          </div>

          <Button type="submit" disabled={isLoading || !newCategory.name.trim()}>
            {isLoading ? "Creating..." : "Add Category"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
