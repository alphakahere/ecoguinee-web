import { api } from './api';
import type { SME } from '@/types';

export const smesService = {
  async getAll(): Promise<SME[]> {
    const { data } = await api.get<SME[]>('/smes');
    return data;
  },

  async getById(id: string): Promise<SME> {
    const { data } = await api.get<SME>(`/smes/${id}`);
    return data;
  },
};
