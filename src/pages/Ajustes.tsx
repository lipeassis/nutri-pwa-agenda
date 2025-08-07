import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, FileText, CreditCard, Wrench, Building2, TestTube, Apple, Star, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Ajustes() {
  const { hasPermission } = useAuth();

  const settingsItems = [
    {
      title: "Tipos de Profissionais",
      description: "Gerencie os tipos de profissionais do sistema",
      icon: UserCog,
      href: "/tipos-profissionais",
      category: "Usuários",
      roles: ["administrador"]
    },
    {
      title: "Usuários",
      description: "Cadastre e gerencie usuários do sistema",
      icon: UserCog,
      href: "/usuarios",
      category: "Usuários",
      roles: ["administrador"]
    },
    {
      title: "Locais de Atendimento",
      description: "Configure os locais onde são realizados os atendimentos",
      icon: Building2,
      href: "/locais-atendimento",
      category: "Configurações",
      roles: ["administrador"]
    },
    {
      title: "Doenças",
      description: "Cadastre e organize doenças para os prontuários",
      icon: FileText,
      href: "/doencas",
      category: "Clínico",
      roles: ["administrador"]
    },
    {
      title: "Convênios",
      description: "Gerencie convênios e planos de saúde",
      icon: CreditCard,
      href: "/convenios",
      category: "Financeiro",
      roles: ["administrador"]
    },
    {
      title: "Serviços",
      description: "Configure os serviços oferecidos",
      icon: Wrench,
      href: "/servicos",
      category: "Configurações",
      roles: ["administrador"]
    },
    {
      title: "Exames Bioquímicos",
      description: "Cadastre tipos de exames bioquímicos",
      icon: TestTube,
      href: "/exames-bioquimicos",
      category: "Clínico",
      roles: ["administrador"]
    },
    {
      title: "Alimentos",
      description: "Base de dados de alimentos e nutrientes",
      icon: Apple,
      href: "/alimentos",
      category: "Nutricional",
      roles: ["administrador"]
    },
    {
      title: "Programas",
      description: "Programas nutricionais personalizados",
      icon: Star,
      href: "/programas",
      category: "Nutricional",
      roles: ["administrador"]
    },
    {
      title: "Fórmulas Magistrais",
      description: "Gerencie fórmulas magistrais e composições",
      icon: FlaskConical,
      href: "/formulas-magistrais",
      category: "Nutricional",
      roles: ["administrador", "profissional"]
    }
  ];

  // Filter items based on user permissions
  const filteredItems = settingsItems.filter(item => {
    return hasPermission(item.roles as any);
  });

  // Group items by category
  const categories = ["Usuários", "Configurações", "Clínico", "Financeiro", "Nutricional"];
  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = filteredItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  // Organize into 3 columns
  const columns = [
    [...groupedItems["Usuários"], ...groupedItems["Configurações"]],
    [...groupedItems["Clínico"], ...groupedItems["Financeiro"]],
    [...groupedItems["Nutricional"]]
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground">
          Configure e gerencie as funcionalidades do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((columnItems, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            {columnItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                        <div className="text-xs text-muted-foreground mt-1 font-medium">
                          {item.category}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}