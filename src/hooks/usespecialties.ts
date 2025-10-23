// ==================== SPECIALTY CUSTOM HOOK ====================
// Manages all specialty operations with state

import { useState, useEffect } from 'react';
import { 
  getSpecialties, 
  getSpecialtyById, 
  createSpecialty, 
  updateSpecialty, 
  deleteSpecialty 
} from '@/services/specialty.service';
import type { 
  Specialty, 
  SpecialtyListParams,
  SpecialtyCreateData,
  SpecialtyUpdateData 
} from '@/types/specialty.types';

export const useSpecialties = (initialParams?: SpecialtyListParams) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [count, setCount] = useState<number>(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSpecialties = async (params?: SpecialtyListParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSpecialties(params);
      setSpecialties(response.results);
      setCount(response.count);
      setNext(response.next);
      setPrevious(response.previous);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (data: SpecialtyCreateData) => {
    try {
      const newSpecialty = await createSpecialty(data);
      setSpecialties(prev => [...prev, newSpecialty]);
      setCount(prev => prev + 1);
      return newSpecialty;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Creation failed');
    }
  };

  const updateItem = async (id: number, data: SpecialtyUpdateData) => {
    try {
      const updated = await updateSpecialty(id, data);
      setSpecialties(prev => prev.map(item => 
        item.id === id ? updated : item
      ));
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Update failed');
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await deleteSpecialty(id);
      setSpecialties(prev => prev.filter(item => item.id !== id));
      setCount(prev => prev - 1);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Delete failed');
    }
  };

  const getById = async (id: number) => {
    try {
      return await getSpecialtyById(id);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Fetch failed');
    }
  };

  useEffect(() => {
    if (initialParams) {
      fetchSpecialties(initialParams);
    }
  }, []);

  return {
    specialties,
    count,
    next,
    previous,
    loading,
    error,
    fetchSpecialties,
    createItem,
    updateItem,
    deleteItem,
    getById,
  };
};