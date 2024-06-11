export const getLastTimestampFromHistory = (jettonHistory: { timestamp: number }[]) => {
    try {
      return jettonHistory[0].timestamp;
    } catch (_) {
      return null;
    }
  };
