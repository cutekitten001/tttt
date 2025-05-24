// Importações do Angular
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  // Injeção de dependências
  private fb: FormBuilder = inject(FormBuilder);
  private authService: AuthService = inject(AuthService);

  // Formulário de recuperação de senha
  forgotPasswordForm!: FormGroup;
  // Controle de estado de carregamento
  isLoading = false;
  // Mensagem de erro
  errorMessage: string | null = null;
  // Mensagem de sucesso
  successMessage: string | null = null;

  ngOnInit(): void {
    // Inicialização do formulário com validadores
    this.forgotPasswordForm = this.fb.group({
      // Valida email e domínio @tahto.com.br ou admin@admin.com
      email: [null, [Validators.required, Validators.email]]
    });
  }

  // Função chamada ao submeter o formulário
  async onSubmit(): Promise<void> {
    // Verifica se o formulário é válido
    if (this.forgotPasswordForm.invalid) {
      this.errorMessage = 'Por favor, informe um email válido.';
      this.successMessage = null;
      return;
    }

    // Ativa o estado de carregamento e limpa mensagens anteriores
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      // Extrai o email do formulário
      const { email } = this.forgotPasswordForm.value;
      // Chama o método de envio de email do serviço de autenticação
      await this.authService.sendPasswordReset(email);
      // Exibe mensagem de sucesso
      this.successMessage = 'Email de redefinição de senha enviado com sucesso! Verifique sua caixa de entrada.';
      // Limpa o formulário
      this.forgotPasswordForm.reset();
    } catch (error: any) {
      // Em caso de erro, exibe a mensagem
      console.error('Erro ao enviar email de redefinição:', error);
       if (error.message.includes('auth/invalid-email') || error.message.includes('auth/user-not-found')) {
        this.errorMessage = 'Email não encontrado ou inválido.';
      } else if (error.message.includes('Email inválido')) {
          this.errorMessage = error.message; // Usa a mensagem específica do AuthService
      } else {
        this.errorMessage = 'Ocorreu um erro ao enviar o email. Tente novamente.';
      }
    } finally {
      // Desativa o estado de carregamento
      this.isLoading = false;
    }
  }
}

