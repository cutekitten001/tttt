// Importações do Angular Router e Guards
import { Routes } from "@angular/router";
import { adminGuard } from "./core/guards/admin.guard"; // Importa o Admin Guard
import { agentGuard } from "./core/guards/agent.guard"; // Importa o Agent Guard
// Importa os guards de autenticação (a serem criados)
// import { authGuard } from \"./core/guards/auth.guard\"; // Guarda geral de autenticação
// import { publicGuard } from \"./core/guards/public.guard\"; // Guarda para rotas públicas (login, etc.)

// Definição das rotas da aplicação
export const routes: Routes = [
  // Rotas de Autenticação (públicas)
  {
    path: "login",
    // canActivate: [publicGuard], // Idealmente, impede acesso se já logado
    loadComponent: () => import("./auth/pages/login/login.component").then(m => m.LoginComponent)
  },
  {
    path: "register",
    // canActivate: [publicGuard],
    loadComponent: () => import("./auth/pages/register/register.component").then(m => m.RegisterComponent)
  },
  {
    path: "forgot-password",
    // canActivate: [publicGuard],
    loadComponent: () => import("./auth/pages/forgot-password/forgot-password.component").then(m => m.ForgotPasswordComponent)
  },

  // Rota do Painel Admin (protegida pelo adminGuard)
  {
    path: "admin/dashboard",
    // canActivate: [authGuard, adminGuard], // Adicionar authGuard quando criado
    canActivate: [adminGuard], // Por enquanto, apenas adminGuard
    loadComponent: () => import("./admin/pages/dashboard/dashboard.component").then(m => m.DashboardComponent)
  },

  // Rota do Painel Agente (protegida pelo agentGuard)
  {
     path: "agente/dashboard",
     // canActivate: [authGuard, agentGuard], // Adicionar authGuard quando criado
     canActivate: [agentGuard], // Por enquanto, apenas agentGuard
     loadComponent: () => import("./agent/pages/dashboard/dashboard.component").then(m => m.DashboardComponent)
     // TODO: Adicionar rotas filhas para o painel agente se necessário
  },

  // Rota padrão (redireciona para login se não autenticado, ou dashboard apropriado se autenticado)
  {
    path: "",
    pathMatch: "full",
    redirectTo: "/login" // Redirecionamento padrão inicial para login
    // TODO: Implementar lógica de redirecionamento dinâmico baseado no estado de autenticação e role
    // Ex: Um AuthRedirectGuard que verifica se está logado e redireciona para /admin/dashboard ou /agente/dashboard
  },

  // Rota Curinga (para páginas não encontradas)
  {
    path: "**",
    redirectTo: "/login" // Ou para uma página 404 dedicada
  }
];

