// Importações do Angular e RxJS
import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Importa DatePipe
import { Observable, of } from 'rxjs';
import { switchMap, catchError, take } from 'rxjs/operators';

// Importações do Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Importações dos Serviços e Interfaces
import { VendaService, Venda } from '../../../core/services/venda.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-sales-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    DatePipe // Adiciona DatePipe aos imports
  ],
  templateUrl: './my-sales-list.component.html',
  styleUrl: './my-sales-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MySalesListComponent implements OnInit {
  // Injeção de dependências
  private vendaService: VendaService = inject(VendaService);
  private authService: AuthService = inject(AuthService);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  // Observable para a lista de vendas do agente
  mySales$: Observable<Venda[]> | undefined;

  // Colunas a serem exibidas na tabela
  displayedColumns: string[] = [
    'ticket',
    'cpfCnpj',
    'dataVenda',
    'tipoVenda',
    'velocidade',
    'status',
    'dataInstalacao',
    'observacao'
    // Adicionar coluna de ações se o agente puder editar/cancelar
  ];

  ngOnInit(): void {
    // Carrega as vendas do agente logado
    this.loadMySales();
  }

  // Carrega as vendas associadas ao agente logado
  loadMySales(): void {
    this.mySales$ = this.authService.getCurrentUser().pipe(
      take(1), // Pega apenas o usuário atual
      switchMap(user => {
        if (user) {
          // Se o usuário estiver logado, busca suas vendas pelo UID
          return this.vendaService.getVendasByAgente(user.uid).pipe(
            catchError(error => {
              console.error('Erro ao buscar vendas do agente:', error);
              this.snackBar.open('Erro ao carregar suas vendas. Tente recarregar a página.', 'Fechar', { duration: 5000 });
              return of([]); // Retorna um array vazio em caso de erro
            })
          );
        } else {
          // Se não houver usuário logado, retorna um array vazio
          console.warn('Usuário não logado ao tentar buscar vendas.');
          return of([]);
        }
      })
    );
    // Força a detecção de mudanças
    this.cdr.markForCheck();
  }

  // Função para visualizar detalhes (pode ser implementada futuramente)
  viewDetails(venda: Venda): void {
    console.log('Visualizar detalhes da venda:', venda);
    // Implementar navegação para uma página de detalhes ou modal
  }
}

