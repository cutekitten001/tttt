// Importações do Angular e RxJS
import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Importações do Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Importações dos Serviços e Interfaces
import { VendaService, Venda } from '../../../core/services/venda.service';

// Lista de UFs (pode vir de um serviço ou constante)
const UFS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    // MatInputMaskModule // Adicionar se a lib de máscara for usada
  ],
  templateUrl: './sales-form.component.html',
  styleUrl: './sales-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesFormComponent implements OnInit {
  // Injeção de dependências
  private fb: FormBuilder = inject(FormBuilder);
  private vendaService: VendaService = inject(VendaService);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  // Formulário de cadastro de venda
  salesForm!: FormGroup;
  // Controle de estado de carregamento
  isLoading = false;

  // Opções para os selects
  ufs = UFS;
  statusOptions: string[] = ['Em Aprovisionamento', 'Pendência', 'Instalada', 'Cancelada'];
  periodoOptions: string[] = ['Manhã', 'Tarde', 'Noite'];
  tipoVendaOptions: string[] = ['Legado', 'Nova Fibra'];
  pagamentoOptions: string[] = ['Boleto', 'Cartão de Crédito', 'Débito em Conta'];
  velocidadeOptions: string[] = ['500MB', '700MB', '1GB'];

  ngOnInit(): void {
    // Inicialização do formulário com validadores
    this.salesForm = this.fb.group({
      cpfCnpj: [null, [Validators.required]], // Adicionar validador de CPF/CNPJ se necessário
      status: ['Em Aprovisionamento', [Validators.required]], // Status inicial padrão
      telefoneContato: [null, [Validators.required]], // Adicionar máscara/validador de telefone
      dataVenda: [new Date(), [Validators.required]], // Data atual como padrão
      dataInstalacao: [null],
      periodo: [null],
      tipoVenda: [null, [Validators.required]],
      pagamento: [null, [Validators.required]],
      ticket: [null, [Validators.required]],
      velocidade: [null, [Validators.required]],
      uf: [null, [Validators.required]],
      os: [null],
      observacao: [null]
    });
  }

  // Função chamada ao submeter o formulário
  async onSubmit(): Promise<void> {
    // Marca todos os campos como tocados para exibir erros
    this.salesForm.markAllAsTouched();

    // Verifica se o formulário é válido
    if (this.salesForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
      return;
    }

    // Ativa o estado de carregamento
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      // Prepara os dados da venda (Omit<> é tratado no serviço)
      const vendaData = this.salesForm.value as Omit<Venda, 'id' | 'agenteUid' | 'agenteTh' | 'agenteNome' | 'createdAt' | 'updatedAt'>;

      // Chama o método de adicionar venda do serviço
      await this.vendaService.addVenda(vendaData);

      // Exibe mensagem de sucesso
      this.snackBar.open('Venda cadastrada com sucesso!', 'Fechar', { duration: 3000 });
      // Limpa o formulário após sucesso
      this.salesForm.reset({
        status: 'Em Aprovisionamento', // Reseta para o status padrão
        dataVenda: new Date() // Reseta data da venda para hoje
      });
      // Garante que o estado de validação seja limpo
      Object.keys(this.salesForm.controls).forEach(key => {
        this.salesForm.get(key)?.setErrors(null) ;
        this.salesForm.get(key)?.markAsUntouched();
        this.salesForm.get(key)?.markAsPristine();
      });
      this.salesForm.updateValueAndValidity();

    } catch (error: any) {
      // Em caso de erro, exibe a mensagem
      console.error('Erro ao cadastrar venda:', error);
      this.snackBar.open(`Erro ao cadastrar venda: ${error.message || 'Tente novamente.'}`, 'Fechar', { duration: 5000 });
    } finally {
      // Desativa o estado de carregamento
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}

