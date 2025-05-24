// Importações do Angular e Componentes Filhos
import { Component } from '@angular/core';
import { AgentListComponent } from '../../components/agent-list/agent-list.component';
import { SalesListComponent } from '../../components/sales-list/sales-list.component';
import { MatTabsModule } from '@angular/material/tabs'; // Para organizar as seções
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service'; // Para logout
import { inject } from '@angular/core'; // Para injeção
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AgentListComponent, // Importa o componente de lista de agentes
    SalesListComponent, // Importa o componente de lista de vendas
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  // Injeta o serviço de autenticação para usar o logout
  private authService: AuthService = inject(AuthService);

  // Função para realizar logout
  logout(): void {
    this.authService.logout();
  }
}

