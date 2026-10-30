import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminModal } from '../../components/sections/AdminModal';
import { Button } from '../../components/ui/Button';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FFF4F6] relative">
      <div className="p-4 flex items-center justify-between border-b border-[#EBD9DE] bg-white/80">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Wedding Site</span>
        </Button>
      </div>

      <AdminModal isOpen={isOpen} onClose={handleClose} />
    </div>
  );
};
