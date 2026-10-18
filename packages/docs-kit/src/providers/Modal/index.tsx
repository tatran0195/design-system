'use client';

import type React from 'react';
import { createContext, useContext, useState } from 'react';
import { Modal, type ModalProps } from '@/components/Modal';

export type ModalContextType = {
  modalProps: ModalProps | null;
  setModalProps: (value: ModalProps | null) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export type ModalProviderProps = {
  children?: React.ReactNode;
};

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modalProps, setModalProps] = useState<ModalProps | null>(null);

  const closeModal = () => {
    setModalProps(null);
  };

  return (
    <ModalContext.Provider
      value={{
        modalProps,
        setModalProps,
        closeModal,
      }}
    >
      {children}
      {modalProps && <Modal {...modalProps} onClose={closeModal} />}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  return context;
};
