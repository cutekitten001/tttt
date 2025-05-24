// Importações do Angular e RxJS
import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

// Importações do Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip'; // Para dicas nos botões

// Importações dos Serviços e Interfaces
import { UserService } from '../../../core/services/user.service';
import { UserProfile } from '../../../core/services/auth.service';

@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './agent-list.component.html',
  styleUrl: './agent-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // Melhora performance
})
export class AgentListComponent implements OnInit {
  // Injeção de dependências
  private userService: UserService = inject(UserService);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef); // Para detecção de mudanças manual

  // Observable para a lista de agentes
  agents$: Observable<UserProfile[]> | undefined;
  // Colunas a serem exibidas na tabela
  displayedColumns: string[] = ['th', 'nome', 'email', 'status', 'acoes'];
  // Controle de estado de carregamento para ações
  loadingAction: { [userId: string]: boolean } = {}; // Mapeia userId para estado de loading

  ngOnInit(): void {
    // Busca todos os agentes ao inicializar o componente
    this.loadAgents();
  }

  // Carrega a lista de agentes
  loadAgents(): void {
    this.agents$ = this.userService.getAllAgents();
    // Força a detecção de mudanças caso o Observable já tenha emitido
    this.cdr.markForCheck();
  }

  // Função para aprovar um agente
  async approveAgent(agent: UserProfile): Promise<void> {
    if (!agent.id) return; // Garante que o agente tem um ID
    this.loadingAction[agent.id] = true; // Ativa loading para este agente
    this.cdr.markForCheck(); // Atualiza a UI

    try {
      await this.userService.updateUserStatus(agent.id, 'aprovado');
      this.snackBar.open(`Agente ${agent.nome} aprovado com sucesso!`, 'Fechar', { duration: 3000 });
      // A lista deve atualizar automaticamente se o Observable estiver ativo,
      // mas podemos forçar o recarregamento se necessário:
      // this.loadAgents();
    } catch (error) {
      console.error('Erro ao aprovar agente:', error);
      this.snackBar.open('Erro ao aprovar agente. Tente novamente.', 'Fechar', { duration: 3000 });
    } finally {
      this.loadingAction[agent.id] = false; // Desativa loading
      this.cdr.markForCheck(); // Atualiza a UI
    }
  }

  // Função para recusar um agente
  async rejectAgent(agent: UserProfile): Promise<void> {
    if (!agent.id) return;
    this.loadingAction[agent.id] = true;
    this.cdr.markForCheck();

    try {
      await this.userService.updateUserStatus(agent.id, 'recusado');
      this.snackBar.open(`Agente ${agent.nome} recusado.`, 'Fechar', { duration: 3000 });
      // this.loadAgents(); // Opcional: Forçar recarregamento
    } catch (error) {
      console.error('Erro ao recusar agente:', error);
      this.snackBar.open('Erro ao recusar agente. Tente novamente.', 'Fechar', { duration: 3000 });
    } finally {
      this.loadingAction[agent.id] = false;
      this.cdr.markForCheck();
    }
  }
}

