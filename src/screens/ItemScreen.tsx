import { ActionButton } from '../components/ActionButton';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { ScreenFrame } from '../components/ScreenFrame';
import { ru } from '../content/ru';
import type { ItemId } from '../game/types';
import { useGameStore } from '../game/store';
import styles from '../app/shell.module.css';

const options = (['flask', 'rope', 'medkit'] as const).map((id) => ({
  id,
  name: ru.item.options[id].name,
  text: ru.item.options[id].text,
  assetId: `item.${id}`,
}));

export function ItemScreen() {
  const pendingItem = useGameStore((state) => state.pendingItem);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const selectItem = useGameStore((state) => state.selectItem);
  const confirmItem = useGameStore((state) => state.confirmItem);

  return (
    <ScreenFrame
      title={ru.item.title}
      actions={
        <ActionButton
          variant="primary"
          disabled={pendingItem == null || isTransitioning}
          onClick={confirmItem}
        >
          {ru.item.continue}
        </ActionButton>
      }
    >
      <p className={styles.note}>{ru.item.caption}</p>
      <ChoiceGroup<ItemId>
        label={ru.item.caption}
        options={options}
        value={pendingItem}
        columns={3}
        disabled={isTransitioning}
        onChange={selectItem}
      />
    </ScreenFrame>
  );
}
