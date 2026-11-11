import { useState } from 'react';
import { getAsset } from '../assets/manifest';
import styles from './shell.module.css';

export function DistrictSpin({ district }: { district: number }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div
      className={styles.sealGate}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setVisible(false);
      }}
    >
      <img src={getAsset(`district.symbol.${district}`).src} alt="" />
    </div>
  );
}
