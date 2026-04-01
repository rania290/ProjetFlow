import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldX,
  ArrowLeft,
  Home,
  Settings,
  Lock
} from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <ShieldX className="w-10 h-10 text-red-600" />
          </motion.div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Accès refusé</h1>
          <p className="text-slate-600 mb-8">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3 text-slate-700">
              <Lock className="w-5 h-5 text-slate-500" />
              <span className="text-sm">
                Cette action nécessite des permissions supplémentaires. Contactez votre administrateur si vous pensez qu'il s'agit d'une erreur.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la page précédente
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Aller au dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
