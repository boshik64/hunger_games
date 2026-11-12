import { useEffect } from 'react';
import { ActionButton } from '../components/ActionButton';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { ScreenFrame } from '../components/ScreenFrame';
import { ru } from '../content/ru';
import type { OutfitId } from '../game/types';
import { useGameStore } from '../game/store';
import styles from '../app/shell.module.css';

const options = (['wedding', 'fire', 'suit'] as const).map((id) => ({
  id,
  name: ru.outfit.options[id].name,
  text: ru.outfit.options[id].text,
  assetId: `still.outfit.${id}`,
}));

export function OutfitScreen() {
  const outfit = useGameStore((state) => state.outfit);
  const pendingOutfit = useGameStore((state) => state.pendingOutfit);
  const selectOutfit = useGameStore((state) => state.selectOutfit);
  const confirmOutfit = useGameStore((state) => state.confirmOutfit);
  const openSkill = useGameStore((state) => state.openSkill);

  useEffect(() => {
    if (!outfit) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => openSkill(), reduce ? 0 : 1500);
    return () => window.clearTimeout(timeout);
  }, [outfit, openSkill]);

  if (outfit) {
    return (
      <ScreenFrame title={ru.outfit.options[outfit].name} actions={null}>
        <p className={styles.lede}>{ru.outfit.options[outfit].reaction}</p>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame
      title={ru.outfit.title}
      actions={
        <ActionButton variant="primary" disabled={pendingOutfit == null} onClick={confirmOutfit}>
          {ru.outfit.confirm}
        </ActionButton>
      }
    >
      <p className={styles.lede}>{ru.outfit.situation}</p>
      <ChoiceGroup<OutfitId>
        label={ru.outfit.situation}
        options={options}
        value={pendingOutfit}
        columns={3}
        layout="tiles"
        onChange={selectOutfit}
      />
    </ScreenFrame>
  );
}
