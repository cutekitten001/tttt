// Importações do Angular e Componentes Filhos
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesFormComponent } from '../../components/sales-form/sales-form.component';
import { MySalesListComponent } from '../../components/my-sales-list/my-sales-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// Importação do Serviço de Autenticação
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-agent',
  standalone: true,
  imports: [
    CommonModule,
    SalesFormComponent, // Importa o formulário de vendas
    MySalesListComponent, // Importa a lista de vendas do agente
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  // Injeta o serviço de autenticação para usar o logout
  private authService: AuthService = inject(AuthService);

  // Obtém o nome do usuário logado (se disponível)
  userName$ = this.authService.getCurrentUserProfile().pipe(
    map(profile => profile?.nome || 'Agente') // Usa 'Agente' como fallback
  );

  // Função para realizar logout
  logout(): void {
    this.authService.logout();
  }
}

// Adiciona a importação que faltou para o pipe(map)
import { map } from 'rxjs/operators';

