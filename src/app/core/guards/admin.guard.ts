// Importações necessárias do Angular e RxJS
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';

// Importação do Serviço de Autenticação e Interface UserProfile
import { AuthService, UserProfile } from '../services/auth.service';

// Guarda de rota funcional para proteger rotas de administrador
export const adminGuard: CanActivateFn = (route, state) => {
  // Injeção do AuthService e Router
  const authService = inject(AuthService);
  const router = inject(Router);

  // Retorna um Observable<boolean> ou UrlTree
  return authService.getCurrentUserProfile().pipe(
    take(1), // Pega apenas o primeiro valor emitido (o perfil atual)
    map((userProfile: UserProfile | null) => {
      // Verifica se o usuário está logado, tem perfil e a role é 'admin'
      const isAdmin = !!userProfile && userProfile.role === 'admin' && userProfile.status === 'aprovado';
      if (isAdmin) {
        return true; // Permite o acesso à rota
      } else {
        // Se não for admin, redireciona para a página de login
        console.warn('Acesso negado: Rota exclusiva para administradores aprovados.');
        return router.createUrlTree(['/login']); // Cria uma UrlTree para redirecionamento
      }
    }),
    // Opcional: Adiciona um tap para logar o resultado do guard
    // tap(isAdmin => console.log('Admin Guard - Acesso permitido:', isAdmin))
  );
};

