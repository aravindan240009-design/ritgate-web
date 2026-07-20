import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStaffEvents } from '../services/api.service';

export function useStaffEventCheck() {
  const { role, getUserId } = useAuth();
  const [hasAssignedEvents, setHasAssignedEvents] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(role === 'STAFF');

  useEffect(() => {
    if (role !== 'STAFF') {
      setHasAssignedEvents(false);
      setLoading(false);
      return;
    }

    const staffCode = getUserId();
    if (!staffCode) {
      setHasAssignedEvents(false);
      setLoading(false);
      return;
    }

    let isMounted = true;
    getStaffEvents(staffCode)
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.events)) {
          const activeEvents = res.events.filter((e: any) => e.status === 'ACTIVE');
          setHasAssignedEvents(activeEvents.length > 0);
        }
      })
      .catch(() => {
        if (isMounted) setHasAssignedEvents(false);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [role, getUserId]);

  return { hasAssignedEvents, loading };
}
