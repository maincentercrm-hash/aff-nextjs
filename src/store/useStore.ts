import { create } from 'zustand'

type DialogRegister = {
  email: string;
  password: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
}

const useDialogRegister = create<DialogRegister>((set) => ({
  email: '',
  password: '',
  open: false,
  onOpen: () => set({ open: true }),
  onClose: () => set({ open: false }),
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
}));


type StoreLogin = {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
}

const useLogin = create<StoreLogin>((set) => ({
  email: '',
  password: '',
  open: false,
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
}))


type StoreMsg = {
  msg: string | null;
  status: 'success' | 'error' | undefined;
  setMsg: (msg: string, status: 'success' | 'error' | undefined) => void;
  clearMsg: () => void;
}

const useStoreMsg = create<StoreMsg>((set) => ({
  msg: null,
  status: undefined,
  setMsg: (msg, status) => set({ msg, status }),
  clearMsg: () => set({ msg: null, status: undefined })
}));

export { useDialogRegister, useStoreMsg, useLogin };
