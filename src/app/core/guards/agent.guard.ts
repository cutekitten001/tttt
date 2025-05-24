// Importações necessárias do Angular e RxJS
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';

// Importação do Serviço de Autenticação e Interface UserProfile
import { AuthService, UserProfile } from '../services/auth.service';

// Guarda de rota funcional para proteger rotas de agente
export const agentGuard: CanActivateFn = (route, state) => {
  // Injeção do AuthService e Router
  const authService = inject(AuthService);
  const router = inject(Router);

  // Retorna um Observable<boolean> ou UrlTree
  return authService.getCurrentUserProfile().pipe(
    take(1), // Pega apenas o primeiro valor emitido (o perfil atual)
    map((userProfile: UserProfile | null) => {
      // Verifica se o usuário está logado, tem perfil, a role é 'agente' e o status é 'aprovado'
      const isApprovedAgent = !!userProfile && userProfile.role === 'agente' && userProfile.status === 'aprovado';
      if (isApprovedAgent) {
        return true; // Permite o acesso à rota
      } else {
        // Se não for agente aprovado, redireciona para a página de login
        console.warn('Acesso negado: Rota exclusiva para agentes aprovados.');
        // Se o usuário estiver logado mas não for agente aprovado (ex: admin ou pendente), desloga?
        // Poderia adicionar uma lógica para redirecionar para uma página de 'acesso pendente' ou similar.
        // Por ora, redireciona para login.
        // authService.logout(); // Opcional: Deslogar se tentar acessar rota indevida?
        return router.createUrlTree(['/login']); // Cria uma UrlTree para redirecionamento
      }
    }),
    // Opcional: Adiciona um tap para logar o resultado do guard
    // tap(isAgent => console.log('Agent Guard - Acesso permitido:', isAgent))
  );
};

