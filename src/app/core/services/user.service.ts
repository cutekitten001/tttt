// Importações necessárias
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, query, where, getDocs, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserProfile } from './auth.service'; // Reutiliza a interface UserProfile

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Injeção do Firestore
  private firestore: Firestore = inject(Firestore);

  // Referência à coleção de usuários no Firestore
  private usersCollection = collection(this.firestore, 'users');

  constructor() { }

  // Método para buscar todos os usuários (agentes) para o painel admin
  // Retorna um Observable que emite a lista de perfis de usuário
  getAllAgents(): Observable<UserProfile[]> {
    // Cria uma query para buscar todos os documentos na coleção 'users'
    // Nota: Em um cenário real, pode ser necessário filtrar por role 'agente'
    // ou adicionar paginação para lidar com grandes volumes de dados.
    const q = query(this.usersCollection);
    // collectionData retorna um Observable que atualiza automaticamente quando os dados mudam
    // O idField 'id' adiciona o ID do documento Firestore a cada objeto UserProfile
    return collectionData(q, { idField: 'id' }) as Observable<UserProfile[]>;
  }

  // Método para buscar todos os usuários com role 'agente'
  getOnlyAgents(): Observable<UserProfile[]> {
    const q = query(this.usersCollection, where('role', '==', 'agente'));
    return collectionData(q, { idField: 'id' }) as Observable<UserProfile[]>;
  }


  // Método para atualizar o status de um usuário (aprovar ou recusar)
  // Recebe o ID do usuário (document ID no Firestore) e o novo status
  async updateUserStatus(userId: string, newStatus: 'aprovado' | 'recusado'): Promise<void> {
    try {
      // Cria uma referência ao documento específico do usuário
      const userDocRef = doc(this.firestore, `users/${userId}`);
      // Atualiza o campo 'status' do documento
      await updateDoc(userDocRef, { status: newStatus });
      console.log(`Status do usuário ${userId} atualizado para ${newStatus}`);

      // Se o usuário for recusado, podemos opcionalmente remover o registro de TH único
      // (Isso depende da regra de negócio: permitir que ele tente se cadastrar novamente?)
      if (newStatus === 'recusado') {
        // Buscar o TH do usuário para remover o registro de unicidade
        // Esta parte exigiria buscar o documento do usuário primeiro para obter o TH
        // const userDoc = await getDoc(userDocRef);
        // if (userDoc.exists()) {
        //   const th = userDoc.data()?.th;
        //   if (th) {
        //     const thDocRef = doc(this.firestore, `users_th/${th}`);
        //     await deleteDoc(thDocRef);
        //     console.log(`Registro de TH ${th} removido para usuário recusado ${userId}`);
        //   }
        // }
      }
    } catch (error) {
      console.error(`Erro ao atualizar status do usuário ${userId}:`, error);
      throw error; // Propaga o erro
    }
  }

  // Método para buscar um usuário pelo seu TH (pode ser útil)
  async getUserByTh(th: string): Promise<UserProfile | null> {
    try {
      const q = query(this.usersCollection, where('th', '==', th));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Assume que TH é único, pega o primeiro resultado
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as UserProfile;
      } else {
        return null; // Nenhum usuário encontrado com esse TH
      }
    } catch (error) {
      console.error(`Erro ao buscar usuário pelo TH ${th}:`, error);
      throw error;
    }
  }
}

