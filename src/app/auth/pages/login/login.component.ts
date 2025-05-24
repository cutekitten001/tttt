// Importações do Angular
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Importações do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common'; // Necessário para *ngIf

// Importação do Serviço de Autenticação
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  // Injeção de dependências
  private fb: FormBuilder = inject(FormBuilder);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  // Formulário de login
  loginForm!: FormGroup;
  // Controle de estado de carregamento
  isLoading = false;
  // Mensagem de erro
  errorMessage: string | null = null;

  ngOnInit(): void {
    // Inicialização do formulário com validadores
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]]
    });
  }

  // Função chamada ao submeter o formulário
  async onSubmit(): Promise<void> {
    // Verifica se o formulário é válido
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
      return;
    }

    // Ativa o estado de carregamento e limpa erros anteriores
    this.isLoading = true;
    this.errorMessage = null;

    try {
      // Extrai os valores do formulário
      const { email, password } = this.loginForm.value;
      // Chama o método de login do serviço de autenticação
      await this.authService.login(email, password);
      // O redirecionamento é feito dentro do AuthService após o login e verificação de role/status
    } catch (error: any) {
      // Em caso de erro, exibe a mensagem
      console.error('Erro detalhado no login:', error);
      if (error.message.includes('auth/invalid-credential')) {
        this.errorMessage = 'Credenciais inválidas. Verifique seu email e senha.';
      } else if (error.message.includes('pendente de aprovação')) {
        this.errorMessage = 'Seu cadastro ainda está pendente de aprovação.';
      } else if (error.message.includes('recusado')) {
          this.errorMessage = 'Seu cadastro foi recusado.';
      } else if (error.message.includes('Email inválido')) {
          this.errorMessage = error.message; // Usa a mensagem específica do AuthService
      } else {
        this.errorMessage = 'Ocorreu um erro durante o login. Tente novamente.';
      }
    } finally {
      // Desativa o estado de carregamento
      this.isLoading = false;
    }
  }
}

