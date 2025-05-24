// Importações necessárias
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp, // Para lidar com datas do Firestore
  orderBy,
  DocumentReference,
  getDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Para obter o ID do agente logado

// Interface para representar os dados de uma Venda
export interface Venda {
  id?: string; // ID do documento Firestore (opcional, adicionado pelo collectionData)
  agenteUid: string; // UID do agente que cadastrou a venda
  agenteTh: string; // TH do agente
  agenteNome: string; // Nome do agente (para facilitar exibição)
  cpfCnpj: string;
  status: 'Em Aprovisionamento' | 'Pendência' | 'Instalada' | 'Cancelada';
  telefoneContato: string;
  dataVenda: Timestamp; // Usar Timestamp do Firestore
  dataInstalacao?: Timestamp | null; // Pode ser nula ou definida depois
  periodo?: 'Manhã' | 'Tarde' | 'Noite' | null;
  tipoVenda: 'Legado' | 'Nova Fibra';
  pagamento: 'Boleto' | 'Cartão de Crédito' | 'Débito em Conta';
  ticket: string;
  velocidade: '500MB' | '700MB' | '1GB';
  uf: string;
  os?: string | null;
  observacao?: string | null;
  // Timestamps automáticos (opcional, mas útil)
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  // Injeção do Firestore e AuthService
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);

  // Referência à coleção de vendas no Firestore
  private vendasCollection = collection(this.firestore, 'vendas');

  constructor() { }

  // Método para adicionar uma nova venda
  async addVenda(vendaData: Omit<Venda, 'id' | 'agenteUid' | 'agenteTh' | 'agenteNome' | 'createdAt' | 'updatedAt'>): Promise<DocumentReference> {
    // Obtém o perfil do usuário logado para pegar UID, TH e Nome
    const userProfile = await this.authService.userProfile$.pipe(take(1)).toPromise();
    if (!userProfile || userProfile.role !== 'agente') {
      throw new Error('Usuário não autenticado ou não é um agente.');
    }

    const newVenda: Omit<Venda, 'id'> = {
      ...vendaData,
      agenteUid: (await this.authService.user$.pipe(take(1)).toPromise())?.uid ?? '', // Pega UID do usuário logado
      agenteTh: userProfile.th,
      agenteNome: userProfile.nome,
      dataVenda: vendaData.dataVenda ? Timestamp.fromDate(new Date(vendaData.dataVenda as any)) : Timestamp.now(), // Converte data string/Date para Timestamp
      dataInstalacao: vendaData.dataInstalacao ? Timestamp.fromDate(new Date(vendaData.dataInstalacao as any)) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Validação básica (pode ser expandida)
    if (!newVenda.agenteUid) {
        throw new Error('Não foi possível obter o ID do agente.');
    }

    try {
      // Adiciona o novo documento à coleção 'vendas'
      const docRef = await addDoc(this.vendasCollection, newVenda);
      console.log('Venda adicionada com ID:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      throw error; // Propaga o erro
    }
  }

  // Método para buscar vendas de um agente específico
  getVendasByAgente(agenteUid: string): Observable<Venda[]> {
    // Cria uma query para buscar vendas onde o campo 'agenteUid' seja igual ao UID fornecido
    const q = query(this.vendasCollection, where('agenteUid', '==', agenteUid), orderBy('createdAt', 'desc'));
    // Retorna um Observable com os dados, incluindo o ID do documento
    return collectionData(q, { idField: 'id' }) as Observable<Venda[]>;
  }

  // Método para buscar todas as vendas (para admin)
  // TODO: Adicionar filtros conforme necessário (status, data, agente, tipo, etc.)
  getAllVendas(): Observable<Venda[]> {
    // Query simples para buscar todas as vendas, ordenadas pela data de criação
    const q = query(this.vendasCollection, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Venda[]>;
  }

  // Método para buscar uma venda específica pelo ID
  async getVendaById(vendaId: string): Promise<Venda | null> {
    try {
      const vendaDocRef = doc(this.firestore, `vendas/${vendaId}`);
      const vendaDocSnap = await getDoc(vendaDocRef);
      if (vendaDocSnap.exists()) {
        return { id: vendaDocSnap.id, ...vendaDocSnap.data() } as Venda;
      } else {
        console.warn(`Venda com ID ${vendaId} não encontrada.`);
        return null;
      }
    } catch (error) {
      console.error(`Erro ao buscar venda ${vendaId}:`, error);
      throw error;
    }
  }


  // Método para atualizar uma venda existente
  async updateVenda(vendaId: string, vendaData: Partial<Omit<Venda, 'id' | 'agenteUid' | 'agenteTh' | 'agenteNome' | 'createdAt'>>): Promise<void> {
    try {
      // Cria uma referência ao documento da venda
      const vendaDocRef = doc(this.firestore, `vendas/${vendaId}`);

      // Prepara os dados para atualização, incluindo o timestamp de atualização
      const dataToUpdate: Partial<Venda> = {
        ...vendaData,
        // Converte datas se necessário
        ...(vendaData.dataVenda && { dataVenda: Timestamp.fromDate(new Date(vendaData.dataVenda as any)) }),
        ...(vendaData.dataInstalacao && { dataInstalacao: Timestamp.fromDate(new Date(vendaData.dataInstalacao as any)) }),
        updatedAt: Timestamp.now()
      };

      // Atualiza o documento no Firestore
      await updateDoc(vendaDocRef, dataToUpdate);
      console.log(`Venda ${vendaId} atualizada com sucesso.`);
    } catch (error) {
      console.error(`Erro ao atualizar venda ${vendaId}:`, error);
      throw error; // Propaga o erro
    }
  }

  // Método para excluir uma venda
  async deleteVenda(vendaId: string): Promise<void> {
    try {
      // Cria uma referência ao documento da venda
      const vendaDocRef = doc(this.firestore, `vendas/${vendaId}`);
      // Exclui o documento
      await deleteDoc(vendaDocRef);
      console.log(`Venda ${vendaId} excluída com sucesso.`);
    } catch (error) {
      console.error(`Erro ao excluir venda ${vendaId}:`, error);
      throw error; // Propaga o erro
    }
  }
}

// Adiciona a importação que faltou para o pipe(take(1))
import { take } from 'rxjs/operators';

