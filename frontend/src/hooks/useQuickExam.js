
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

export default function useQuickExam(licenseClass) {
  const navigate = useNavigate();
  const [startingExpress, setStartingExpress] = useState(false);

  const handleStartExpress = async () => {
    setStartingExpress(true);

    try {
      const res = await apiFetch(
        `/tests/quick?clase_licencia=${encodeURIComponent(licenseClass)}`,
        { method: 'POST' }
      );

      navigate(`/test/${res.id}?mode=exam`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setStartingExpress(false);
    }
  };

  return {
    startingExpress,
    handleStartExpress
  };
}
