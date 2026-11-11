import { ActionButton } from '../components/ActionButton';
import { AssetImage } from '../components/AssetImage';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { ScreenFrame } from '../components/ScreenFrame';
import { ru } from '../content/ru';
import type { StrategyId } from '../game/types';
import { useGameStore } from '../game/store';
import styles from '../app/shell.module.css';

const options = (['risk', 'careful'] as const).map((id) => ({
  id,
  name: ru.strategy.options[id].name,
  text: ru.strategy.options[id].text,
  assetId: id === 'risk' ? 'scene.strategy.path.ravine' : 'scene.strategy.path.forest',
}));

export function StrategyScreen() {
  const item = useGameStore((state) => state.item);
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
      <p className={styles.lede}>{ru.strategy.situation}</p>
      {item ? (
        <div className={styles.chip}>
          <AssetImage id={`item.${item}`} alt="" />
          <span>{ru.item.options[item].name}</span>
        </div>
      ) : null}
      <ChoiceGroup<StrategyId>
        label={ru.strategy.situation}
        options={options}
        value={pendingStrategy}
        columns={2}
        disabled={isTransitioning}
        onChange={selectStrategy}
      />
    </ScreenFrame>
  );
}
