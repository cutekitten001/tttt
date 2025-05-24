// Importações necessárias do Angular e Firebase
import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, user, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

// Interface para representar os dados do usuário no Firestore
export interface UserProfile {
  id: any;
  th: string;
  nome: string;
  email: string;
  role: 'admin' | 'agente';
  status: 'pendente' | 'aprovado' | 'recusado';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Injeção dos serviços do Firebase Auth, Firestore e Angular Router
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);

  // BehaviorSubject para manter o estado atual do usuário logado
  private userSubject = new BehaviorSubject<User | null>(null);
  // Observable público para que outros componentes possam se inscrever às mudanças no estado do usuário
  user$ = this.userSubject.asObservable();
  // BehaviorSubject para manter o perfil do usuário logado (dados do Firestore)
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  // Observable público para o perfil do usuário
  userProfile$ = this.userProfileSubject.asObservable();

  constructor() {
    // Monitora o estado de autenticação do Firebase em tempo real
    onAuthStateChanged(this.auth, async (user) => {
      this.userSubject.next(user); // Atualiza o BehaviorSubject do usuário
      if (user) {
        // Se um usuário estiver logado, busca seu perfil no Firestore
        await this.loadUserProfile(user.uid);
      } else {
        // Se não houver usuário logado, limpa o perfil
        this.userProfileSubject.next(null);
      }
    });
  }

  // Função para carregar o perfil do usuário do Firestore
  async loadUserProfile(uid: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        // Se o documento do usuário existir, atualiza o BehaviorSubject do perfil
        this.userProfileSubject.next(userDocSnap.data() as UserProfile);
      } else {
        // Se não existir (caso raro após login), limpa o perfil
        console.error('Documento do usuário não encontrado no Firestore:', uid);
        this.userProfileSubject.next(null);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      this.userProfileSubject.next(null);
    }
  }

  // Função de Login
  async login(email: string, password: string): Promise<void> {
    try {
      // Validação básica do domínio (permitindo admin@admin.com)
      if (!email.endsWith('@tahto.com.br') && email !== 'admin@admin.com') {
        throw new Error('Email inválido. Utilize seu email corporativo @tahto.com.br.');
      }

      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      // Após login bem-sucedido, o onAuthStateChanged cuidará de carregar o perfil e redirecionar
      // Mas podemos forçar o carregamento do perfil aqui se necessário
      await this.loadUserProfile(userCredential.user.uid);
      const userProfile = this.userProfileSubject.value;

      // Redirecionamento baseado na role
      if (userProfile?.status !== 'aprovado') {
        await this.logout(); // Desloga se não estiver aprovado
        throw new Error('Seu cadastro ainda está pendente de aprovação ou foi recusado.');
      }

      if (userProfile?.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (userProfile?.role === 'agente') {
        this.router.navigate(['/agente/dashboard']);
      } else {
        // Caso inesperado, desloga e redireciona para login
        await this.logout();
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      // Propaga o erro para ser tratado no componente
      throw error;
    }
  }

  // Função de Cadastro
  async register(th: string, nome: string, email: string, password: string): Promise<void> {
    try {
      // Validação do domínio do email
      if (!email.endsWith('@tahto.com.br')) {
        throw new Error('Email inválido. Utilize um email corporativo @tahto.com.br.');
      }
      // Validação de TH único (simples verificação se já existe)
      const thDocRef = doc(this.firestore, `users_th/${th}`);
      const thDocSnap = await getDoc(thDocRef);
      if (thDocSnap.exists()) {
        throw new Error('O TH informado já está cadastrado.');
      }

      // Cria o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Cria o perfil do usuário no Firestore
      const userProfile: UserProfile = {
        th: th,
        nome: nome,
        email: email,
        role: 'agente', // Novos cadastros são sempre agentes
        status: 'pendente' // Status inicial pendente
        ,
        id: undefined
      };
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userDocRef, userProfile);

      // Cria um documento para garantir a unicidade do TH
      await setDoc(thDocRef, { userId: user.uid });

      // Desloga o usuário após o cadastro para aguardar aprovação
      await this.logout();

    } catch (error) {
      console.error('Erro no cadastro:', error);
      // Propaga o erro para ser tratado no componente
      throw error;
    }
  }

  // Função de Logout
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.userSubject.next(null); // Limpa o usuário
      this.userProfileSubject.next(null); // Limpa o perfil
      this.router.navigate(['/login']); // Redireciona para a página de login
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  // Função para Enviar Email de Redefinição de Senha
  async sendPasswordReset(email: string): Promise<void> {
    try {
      // Validação do domínio do email
      if (!email.endsWith('@tahto.com.br') && email !== 'admin@admin.com') {
        throw new Error('Email inválido. Utilize seu email corporativo @tahto.com.br.');
      }
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Erro ao enviar email de redefinição de senha:', error);
      throw error;
    }
  }

  // Getter para verificar se o usuário está autenticado
  get isLoggedIn(): Observable<boolean> {
    return new Observable(subscriber => {
      onAuthStateChanged(this.auth, user => {
        subscriber.next(!!user);
      });
    });
  }

  // Getter para obter o usuário atual (Firebase User)
  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }

  // Getter para obter o perfil do usuário atual (UserProfile do Firestore)
  getCurrentUserProfile(): Observable<UserProfile | null> {
    return this.userProfile$;
  }
}

