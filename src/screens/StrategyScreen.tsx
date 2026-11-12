import { ActionButton } from '../components/ActionButton';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { ScreenFrame } from '../components/ScreenFrame';
import { ru } from '../content/ru';
import type { StrategyId } from '../game/types';
import { useGameStore } from '../game/store';
import styles from '../app/shell.module.css';

const options = (['risk', 'careful'] as const).map((id) => ({
  id,
  name: ru.strategy.options[id].name,
  text: ru.strategy.cues[id],
  assetId: id === 'risk' ? 'still.arena.risk' : 'still.arena.careful',
}));

export function StrategyScreen() {
  const pendingStrategy = useGameStore((state) => state.pendingStrategy);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const selectStrategy = useGameStore((state) => state.selectStrategy);
  const confirmStrategy = useGameStore((state) => state.confirmStrategy);

  return (
    <ScreenFrame
      title={ru.strategy.title}
      actions={
        <ActionButton
          variant="primary"
          disabled={pendingStrategy == null || isTransitioning}
          onClick={confirmStrategy}
        >
          {ru.strategy.confirm}
        </ActionButton>
      }
    >
      <p className={styles.lede}>{ru.strategy.arena}</p>
      <ChoiceGroup<StrategyId>
        label={ru.strategy.arena}
        options={options}
        value={pendingStrategy}
        columns={2}
        layout="tiles"
        disabled={isTransitioning}
        onChange={selectStrategy}
      />
    </ScreenFrame>
  );
}
