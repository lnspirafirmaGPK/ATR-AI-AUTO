// src/components/common/LockOverlay.jsx
import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from './Button';
import { t } from '../../utils/i18n';
import { useNavigate } from 'react-router-dom';

export function LockOverlay({ message }) {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg p-4 text-center">
      <Lock className="w-12 h-12 text-white mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">{t('lockedFeature')}</h3>
      {message && <p className="text-gray-200 mb-6 max-w-sm">{message}</p>}
      <Button
        variant="primary"
        onClick={() => navigate('/subscription')}
      >
        {t('upgradeToPro')}
      </Button>
    </div>
  );
}
