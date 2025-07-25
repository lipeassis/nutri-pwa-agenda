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
import { Calendar, Users, Home, Menu, LogOut, UserCog, X, TestTube, CreditCard, FileText, Settings, Wrench, TrendingUp } from "lucide-react";
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

          {/* User info and logout */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.nome} ({user?.role})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
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
            
            {/* Mobile user info and logout */}
            <div className="border-t pt-4 mt-4 space-y-2">
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {user?.nome} ({user?.role})
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full justify-start gap-2"
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