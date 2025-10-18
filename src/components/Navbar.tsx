import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { LogOut, FileText, UserPlus, Menu, LayoutDashboard } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useState } from "react";

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
      console.error(error);
    }
  };

  const getUserInitials = () => {
    if (!currentUser?.nome) return "U";
    return currentUser.nome.charAt(0).toUpperCase();
  };

  const isAdmin = currentUser?.perfil === "admin";

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      onClick: () => {
        navigate("/");
        setMobileMenuOpen(false);
      },
      show: true,
    },
    {
      label: "Registrar EG",
      icon: FileText,
      onClick: () => {
        navigate("/register-eg");
        setMobileMenuOpen(false);
      },
      show: true,
    },
    {
      label: "Gerenciar Usuários",
      icon: UserPlus,
      onClick: () => {
        navigate("/users");
        setMobileMenuOpen(false);
      },
      show: isAdmin,
    },
  ];

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo e Nome do Usuário */}
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm">{currentUser?.nome || "Usuário"}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {currentUser?.perfil || "Usuário"}
              </p>
            </div>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => {
              if (!item.show) return null;
              const Icon = item.icon;
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={item.onClick}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
            <Button onClick={handleLogout} variant="outline" className="gap-2 ml-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </nav>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="pb-4 border-b border-border">
                    <p className="font-medium">{currentUser?.nome}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {currentUser?.perfil}
                    </p>
                  </div>
                  
                  {menuItems.map((item) => {
                    if (!item.show) return null;
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.label}
                        variant="ghost"
                        onClick={item.onClick}
                        className="justify-start gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                  
                  <Button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="justify-start gap-2 mt-4"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
