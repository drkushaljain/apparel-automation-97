import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CustomerCategory } from "@/types";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = '/api/customer-categories';

const CustomerCategories = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<CustomerCategory | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_BASE_URL);
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories:', response.statusText);
        toast.error("Failed to load customer categories");
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error("Could not connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const newCategory: Omit<CustomerCategory, 'id'> = {
        name: categoryName.trim(),
        description: categoryDescription.trim() || undefined,
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        const createdCategory = await response.json();
        setCategories([...categories, createdCategory]);
        setCategoryName("");
        setCategoryDescription("");
        setIsAddDialogOpen(false);
        toast.success("Category added successfully");
      } else {
        toast.error("Failed to add category");
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error("Could not connect to the server");
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const updatedCategory = {
        ...editingCategory,
        name: categoryName.trim(),
        description: categoryDescription.trim() || undefined
      };

      const response = await fetch(`${API_BASE_URL}/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });

      if (response.ok) {
        const result = await response.json();
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? result : cat
        ));
        
        setCategoryName("");
        setCategoryDescription("");
        setEditingCategory(null);
        setIsEditDialogOpen(false);
        toast.success("Category updated successfully");
      } else {
        toast.error("Failed to update category");
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error("Could not connect to the server");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/${categoryId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCategories(categories.filter(cat => cat.id !== categoryId));
          toast.success("Category deleted successfully");
        } else {
          toast.error("Failed to delete category");
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error("Could not connect to the server");
      }
    }
  };

  const startEditCategory = (category: CustomerCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight ml-2">Customer Categories</h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new category for organizing your customers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Enter category description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory}>Add Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update the details of this customer category.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Category Name</Label>
                  <Input
                    id="edit-name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description (Optional)</Label>
                  <Input
                    id="edit-description"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Enter category description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditCategory}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Categories</CardTitle>
            <CardDescription>
              Create and manage categories to organize your customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <p className="text-muted-foreground">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No categories found. Add your first category to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CustomerCategories;
