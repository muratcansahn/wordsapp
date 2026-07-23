import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { initializeAdmob } from '@/services/admob/admobService';

export const useAdmob = () => {
  const dispatch = useDispatch<AppDispatch>();
  const admobState = useSelector((state: RootState) => state.admob);

  const initializeAdmobService = useCallback(() => {
    initializeAdmob(dispatch);
  }, [dispatch]);

  return {
    initializeAdmobService,
    admobState,
  };
};
