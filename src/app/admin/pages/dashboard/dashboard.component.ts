import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { AgentListComponent } from '../../components/agent-list/agent-list.component';
import { SalesListComponent } from '../../components/sales-list/sales-list.component';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    RouterModule,
    DatePipe,
    AgentListComponent,
    SalesListComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  // Injeta o serviço de autenticação para usar o logout
  private authService: AuthService = inject(AuthService);

  // Dados para exibição (substitua por dados reais do seu serviço)
  currentDate: Date = new Date();
  agentCount: number = 42;
  salesCount: number = 128;
  approvalsCount: number = 37;
  // Função para realizar logout
  logout(): void {
    this.authService.logout();
  }
}

