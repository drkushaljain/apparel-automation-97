
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserPlus } from "lucide-react";
import NoContent from "@/components/NoContent";
import UserTable from "@/components/users/UserTable";

const Users = () => {
  const { state, deleteUser } = useAppContext();
  const { users, currentUser } = state;
  const navigate = useNavigate();

  // Only admin can access this page
  if (currentUser?.role !== "admin") {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to access this page.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <Button onClick={() => navigate("/users/new")}>
          <UserPlus className="h-4 w-4 mr-2" />
          New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <NoContent
              title="No users found"
              description="You haven't added any users yet."
              actionText="Add User"
              actionLink="/users/new"
              icon={<User className="h-12 w-12 text-primary/20" />}
            />
          ) : (
            <UserTable 
              users={users} 
              currentUser={currentUser} 
              onDeleteUser={deleteUser} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
