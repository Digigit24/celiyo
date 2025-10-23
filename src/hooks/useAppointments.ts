import { useState, useEffect, useCallback } from 'react';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  checkInAppointment,
  startAppointment,
  completeAppointment,
  getTodayAppointments,
  getUpcomingAppointments,
} from '@/services/appointment.service';
import type {
  AppointmentList,
  AppointmentDetail,
  AppointmentCreateData,
  AppointmentUpdateData,
  AppointmentListParams,
} from '@/types/appointment.types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentList[]>([]);
  const [count, setCount] = useState<number>(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(
    async (params?: AppointmentListParams) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAppointments(params);
        setAppointments(response.results);
        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createItem = async (data: AppointmentCreateData) => {
    try {
      const newAppointment = await createAppointment(data);
      setAppointments((prev) => [newAppointment as any, ...prev]);
      setCount((prev) => prev + 1);
      return newAppointment;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to create appointment'
      );
    }
  };

  const updateItem = async (id: number, data: AppointmentUpdateData) => {
    try {
      const updated = await updateAppointment(id, data);
      setAppointments((prev) =>
        prev.map((item) => (item.id === id ? (updated as any) : item))
      );
      return updated;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to update appointment'
      );
    }
  };

  const deleteItem = async (id: number, cancellation_reason?: string) => {
    try {
      await deleteAppointment(id, cancellation_reason);
      setAppointments((prev) => prev.filter((item) => item.id !== id));
      setCount((prev) => prev - 1);
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to delete appointment'
      );
    }
  };

  const checkIn = async (id: number) => {
    try {
      const updated = await checkInAppointment(id);
      setAppointments((prev) =>
        prev.map((item) => (item.id === id ? (updated as any) : item))
      );
      return updated;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to check-in'
      );
    }
  };

  const start = async (id: number) => {
    try {
      const updated = await startAppointment(id);
      setAppointments((prev) =>
        prev.map((item) => (item.id === id ? (updated as any) : item))
      );
      return updated;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to start appointment'
      );
    }
  };

  const complete = async (id: number) => {
    try {
      const updated = await completeAppointment(id);
      setAppointments((prev) =>
        prev.map((item) => (item.id === id ? (updated as any) : item))
      );
      return updated;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to complete appointment'
      );
    }
  };

  return {
    appointments,
    count,
    next,
    previous,
    loading,
    error,
    fetchAppointments,
    createItem,
    updateItem,
    deleteItem,
    checkIn,
    start,
    complete,
  };
};

// Hook for single appointment detail
export const useAppointment = (id: number | null) => {
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setAppointment(null);
      return;
    }

    const fetchAppointment = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAppointmentById(id);
        setAppointment(data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch appointment');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  return { appointment, loading, error };
};

// Hook for today's appointments
export const useTodayAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodayAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch today\'s appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  return { appointments, loading, error, refetch: fetchToday };
};

// Hook for upcoming appointments
export const useUpcomingAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcoming = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUpcomingAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch upcoming appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  return { appointments, loading, error, refetch: fetchUpcoming };
};