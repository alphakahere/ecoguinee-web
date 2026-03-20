import { api } from './api';
import type { Territoire, Sector } from '@/types';

export const zonesService = {
  async getAll(): Promise<Territoire[]> {
    const { data } = await api.get<Territoire[]>('/zones');
    return data;
  },

  async getByType(type: string): Promise<Territoire[]> {
    const { data } = await api.get<Territoire[]>('/zones', {
      params: { type },
    });
    return data;
  },

  async getById(id: string): Promise<Territoire> {
    const { data } = await api.get<Territoire>(`/zones/${id}`);
    return data;
  },

  async getChildren(parentId: string): Promise<Sector[]> {
    const { data } = await api.get<Sector[]>(`/zones/${parentId}/children`);
    return data;
  },
};
