// Importações do Angular e RxJS
import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Importa DatePipe
import { Observable, combineLatest } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Importações do Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Necessário para MatDatepicker
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

// Importações dos Serviços e Interfaces
import { VendaService, Venda } from '../../../core/services/venda.service';
import { UserService } from '../../../core/services/user.service';// Para buscar lista de agentes para filtro
import { UserProfile } from '../../../core/services/auth.service'

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    DatePipe // Adiciona DatePipe aos imports
  ],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesListComponent implements OnInit {
  // Injeção de dependências
  private vendaService: VendaService = inject(VendaService);
  private userService: UserService = inject(UserService);
  private fb: FormBuilder = inject(FormBuilder);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  // Observables para dados e filtros
  allSales$: Observable<Venda[]> | undefined;
  filteredSales$: Observable<Venda[]> | undefined;
  agents$: Observable<UserProfile[]> | undefined;

  // Formulário de filtros
  filterForm!: FormGroup;

  // Colunas a serem exibidas na tabela
  displayedColumns: string[] = [
    'ticket',
    'agenteNome',
    'cpfCnpj',
    'dataVenda',
    'tipoVenda',
    'velocidade',
    'status',
    'acoes' // Coluna para futuras ações (visualizar detalhes, etc.)
  ];

  // Opções para filtros
  statusOptions: string[] = ['Em Aprovisionamento', 'Pendência', 'Instalada', 'Cancelada'];
  tipoVendaOptions: string[] = ['Legado', 'Nova Fibra'];

  ngOnInit(): void {
    // Inicializa o formulário de filtros
    this.filterForm = this.fb.group({
      status: [null],
      dataInicio: [null],
      dataFim: [null],
      agente: [null],
      tipo: [null]
    });

    // Carrega os dados iniciais
    this.loadInitialData();

    // Configura o observable de vendas filtradas
    this.setupFilteredSales();
  }

  // Carrega a lista de vendas e agentes
  loadInitialData(): void {
    this.allSales$ = this.vendaService.getAllVendas();
    this.agents$ = this.userService.getOnlyAgents(); // Busca apenas agentes para o filtro
    this.cdr.markForCheck();
  }

  // Configura o observable que aplica os filtros
  setupFilteredSales(): void {
    if (!this.allSales$) return;

    // Combina o observable de todas as vendas com as mudanças nos valores do formulário de filtro
    this.filteredSales$ = combineLatest([
      this.allSales$,
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value)) // Inclui o valor inicial
    ]).pipe(
      map(([sales, filters]) => {
        // Aplica os filtros
        return sales.filter(sale => {
          const statusMatch = !filters.status || sale.status === filters.status;
          const tipoMatch = !filters.tipo || sale.tipoVenda === filters.tipo;
          const agenteMatch = !filters.agente || sale.agenteUid === filters.agente;

          // Filtro de data (requer conversão de Timestamp para Date)
          const dataVenda = sale.dataVenda.toDate(); // Converte Timestamp para Date
          const dataInicioMatch = !filters.dataInicio || dataVenda >= filters.dataInicio;
          
          const endDate = this.adjustEndDate(filters.dataFim);
          const dataFimMatch = !filters.dataFim || (endDate !== null && dataVenda <= endDate);

          return statusMatch && tipoMatch && agenteMatch && dataInicioMatch && dataFimMatch;
        });
      })
    );
    this.cdr.markForCheck();
  }

  // Ajusta a data final para incluir o dia inteiro
  adjustEndDate(date: Date | null): Date | null {
    if (!date) return null;
    const adjustedDate = new Date(date);
    adjustedDate.setHours(23, 59, 59, 999); // Define para o final do dia
    return adjustedDate;
  }

  // Limpa os filtros
  clearFilters(): void {
    this.filterForm.reset();
    // O observable filteredSales$ será atualizado automaticamente devido ao valueChanges
  }

  // Função para visualizar detalhes (pode ser implementada futuramente)
  viewDetails(venda: Venda): void {
    console.log('Visualizar detalhes da venda:', venda);
    // Implementar navegação para uma página de detalhes ou modal
  }
}

