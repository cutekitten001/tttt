import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Importações necessárias do Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

// Objeto de configuração do Firebase fornecido pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyDVppGr3ZwotmOMfi0jygTGjV8akwO4OkA",
  authDomain: "tlv-bov-ff1b1.firebaseapp.com",
  projectId: "tlv-bov-ff1b1",
  storageBucket: "tlv-bov-ff1b1.firebasestorage.app",
  messagingSenderId: "375913734809",
  appId: "1:375913734809:web:8bcb7ada467d471d778e08"
};

// Configuração da aplicação Angular
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Configuração padrão do Zone.js
    provideRouter(routes), // Configuração das rotas da aplicação
    provideAnimationsAsync(), // Habilita as animações do Angular Material de forma assíncrona

    // Configuração manual do Firebase
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // Inicializa o app Firebase
    provideAuth(() => getAuth()), // Disponibiliza o serviço de Autenticação (Auth)
    provideFirestore(() => getFirestore()) // Disponibiliza o serviço do Firestore Database
  ]
};

