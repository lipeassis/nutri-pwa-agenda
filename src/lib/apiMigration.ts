import { useLocalStorage } from '@/hooks/useLocalStorage';

/**
 * Utilitário para migração gradual do localStorage para API
 * Use este utilitário durante a transição para facilitar o switch entre localStorage e API
 */

export const API_MIGRATION_CONFIG = {
  useApi: false, // Alterne para true quando estiver pronto para usar a API
  endpoints: {
    clientes: '/clientes',
    agendamentos: '/agendamentos', 
    consultas: '/consultas',
    usuarios: '/usuarios',
    servicos: '/servicos',
    clinicas: '/clinicas',
    convenios: '/convenios',
    doencas: '/doencas',
    alergias: '/alergias',
    exameBioquimicos: '/exames-bioquimicos',
    formulasMagistrais: '/formulas-magistrais',
    alimentos: '/alimentos',
    documentosPadrao: '/documentos-padrao',
    dashboard: '/dashboard',
    tiposProfissionais: '/tipos-profissionais',
    locaisAtendimento: '/locais-atendimento',
    programas: '/programas',
    planejamentosPadrao: '/planejamentos-padrao'
  }
};

export function useDataSource<T>(
  localStorageKey: string,
  defaultValue: T,
  apiHook?: () => { data: T; loading: boolean; error: string | null }
) {
  const [localData, setLocalData] = useLocalStorage<T>(localStorageKey, defaultValue);
  
  if (API_MIGRATION_CONFIG.useApi && apiHook) {
    const { data, loading, error } = apiHook();
    return {
      data,
      loading,
      error,
      setData: () => {
        throw new Error('Direct data modification not supported in API mode. Use API methods instead.');
      },
      isApiMode: true
    };
  }

  return {
    data: localData,
    loading: false,
    error: null,
    setData: setLocalData,
    isApiMode: false
  };
}

/**
 * Hook para detectar se estamos em modo API
 */
export function useIsApiMode() {
  return API_MIGRATION_CONFIG.useApi;
}

/**
 * Função para ativar o modo API
 */
export function enableApiMode() {
  API_MIGRATION_CONFIG.useApi = true;
}

/**
 * Função para desativar o modo API (fallback para localStorage)
 */
export function disableApiMode() {
  API_MIGRATION_CONFIG.useApi = false;
}