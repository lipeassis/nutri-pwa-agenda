import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Calendar, Users, Home, Menu, LogOut, UserCog, X, TestTube, CreditCard, FileText, Settings, Wrench, TrendingUp, Apple, User, Lock, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();

  const mainNavItems = [
    { href: "/", icon: Home, label: "Dashboard", roles: ['secretaria', 'profissional', 'administrador'] },
    { href: "/clientes", icon: Users, label: "Clientes", roles: ['secretaria', 'profissional', 'administrador'] },
    { href: "/agenda", icon: Calendar, label: "Agenda", roles: ['secretaria', 'profissional', 'administrador'] },
    { href: "/financeiro", icon: TrendingUp, label: "Financeiro", roles: ['profissional', 'administrador'] },
  ].filter(item => hasPermission(item.roles as any));

  const adminItems = [
    { href: "/tipos-profissionais", icon: UserCog, label: "Tipos de Profissionais" },
    { href: "/usuarios", icon: UserCog, label: "Usuários" },
    { href: "/doencas", icon: FileText, label: "Doenças" },
    { href: "/convenios", icon: CreditCard, label: "Convênios" },
    { href: "/servicos", icon: Wrench, label: "Serviços" },
    { href: "/exames-bioquimicos", icon: TestTube, label: "Exames Bioquímicos" },
    { href: "/alimentos", icon: Apple, label: "Alimentos" },
  ];

  return (
    <nav className={cn("bg-card border-b border-border shadow-soft", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <span className="font-semibold text-lg text-primary">NutriApp</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {mainNavItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <Link to={item.href}>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
                
                {hasPermission('administrador') && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      <Settings className="w-4 h-4 mr-2" />
                      Ajustes
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[240px] gap-1 p-4 bg-white border border-border rounded-md shadow-lg">
                        {adminItems.map((item) => (
                          <li key={item.href}>
                            <Link to={item.href}>
                              <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                <div className="flex items-center gap-2">
                                  <item.icon className="w-4 h-4 text-muted-foreground" />
                                  <div className="text-sm font-medium leading-none text-foreground">{item.label}</div>
                                </div>
                              </NavigationMenuLink>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User Menu Dropdown */}
          <div className="hidden md:flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-auto py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user?.nome}</span>
                      <span className="text-xs text-muted-foreground">{user?.role}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border border-border shadow-lg">
                <DropdownMenuItem asChild>
                  <Link to="/perfil" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Editar Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/trocar-senha" className="flex items-center gap-2 cursor-pointer">
                    <Lock className="w-4 h-4" />
                    Trocar Senha
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              
              {hasPermission('administrador') && (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-t pt-4 mt-2">
                    Ajustes
                  </div>
                  {adminItems.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center space-x-2 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </>
              )}
            </div>
            
            {/* Mobile user info and menu */}
            <div className="border-t pt-4 mt-4 space-y-2">
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {user?.nome} ({user?.role})
              </div>
              <NavLink
                to="/perfil"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <User className="w-4 h-4" />
                <span>Editar Perfil</span>
              </NavLink>
              <NavLink
                to="/trocar-senha"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Lock className="w-4 h-4" />
                <span>Trocar Senha</span>
              </NavLink>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full justify-start gap-2 text-red-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}