import { useEffect, useState } from 'react';

export default function GetIP() {
  const [ip, setIp] = useState('');

  useEffect(() => {
    const fetchIP = async () => {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      setIp(data.ip);
    };

    fetchIP();
  }, []);

  return ip;
}
