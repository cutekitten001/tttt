// Importações do Angular
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';

// Importações do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common'; // Necessário para *ngIf

// Importação do Serviço de Autenticação
import { AuthService } from '../../../core/services/auth.service';

// Validador customizado para verificar se as senhas coincidem
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const repeatPassword = control.get('repeatPassword')?.value;
  // Retorna um erro se as senhas não coincidirem e ambos os campos tiverem sido tocados
  return password === repeatPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  // Injeção de dependências
  private fb: FormBuilder = inject(FormBuilder);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  // Formulário de cadastro
  registerForm!: FormGroup;
  // Controle de estado de carregamento
  isLoading = false;
  // Mensagem de erro
  errorMessage: string | null = null;
  // Mensagem de sucesso
  successMessage: string | null = null;

  ngOnInit(): void {
    // Inicialização do formulário com validadores
    this.registerForm = this.fb.group({
      th: [null, [Validators.required]], // ID único obrigatório
      nome: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@tahto\.com\.br$/)]], // Valida email e domínio @tahto.com.br
      password: [null, [Validators.required, Validators.minLength(6)]], // Senha com mínimo de 6 caracteres
      repeatPassword: [null, [Validators.required]]
    }, { validators: passwordMatchValidator }); // Aplica o validador de confirmação de senha ao grupo
  }

  // Função chamada ao submeter o formulário
  async onSubmit(): Promise<void> {
    // Marca todos os campos como tocados para exibir erros
    this.registerForm.markAllAsTouched();

    // Verifica se o formulário é válido
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente e verifique se as senhas coincidem.';
      this.successMessage = null;
      return;
    }

    // Ativa o estado de carregamento e limpa mensagens anteriores
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      // Extrai os valores do formulário
      const { th, nome, email, password } = this.registerForm.value;
      // Chama o método de cadastro do serviço de autenticação
      await this.authService.register(th, nome, email, password);
      // Exibe mensagem de sucesso e redireciona após um tempo
      this.successMessage = 'Cadastro realizado com sucesso! Seu acesso está pendente de aprovação pelo administrador.';
      // Limpa o formulário após sucesso
      this.registerForm.reset();
      // Opcional: redirecionar para login após um delay
      // setTimeout(() => this.router.navigate(['/login']), 3000);
    } catch (error: any) {
      // Em caso de erro, exibe a mensagem
      console.error('Erro detalhado no cadastro:', error);
      if (error.message.includes('auth/email-already-in-use')) {
        this.errorMessage = 'Este email já está cadastrado.';
      } else if (error.message.includes('O TH informado já está cadastrado')) {
        this.errorMessage = error.message; // Usa a mensagem específica do AuthService
      } else if (error.message.includes('Email inválido')) {
          this.errorMessage = error.message; // Usa a mensagem específica do AuthService
      } else {
        this.errorMessage = 'Ocorreu um erro durante o cadastro. Tente novamente.';
      }
    } finally {
      // Desativa o estado de carregamento
      this.isLoading = false;
    }
  }
}

