import { ActionButton } from '../components/ActionButton';
import { ScreenFrame } from '../components/ScreenFrame';
import { ru } from '../content/ru';
import { useGameStore } from '../game/store';
import styles from '../app/shell.module.css';

export function ScoreScreen() {
  const skill = useGameStore((state) => state.skill);
  const score = useGameStore((state) => state.score);
  const acceptGift = useGameStore((state) => state.acceptGift);
  const comment = skill ? ru.skill.options[skill].comment : '';

  return (
    <ScreenFrame
      title={score == null ? '' : ru.score.of(score)}
      actions={
        <ActionButton variant="primary" disabled={score == null} onClick={acceptGift}>
          {ru.score.gift}
        </ActionButton>
      }
    >
      <p className={styles.lede}>{comment}</p>
      <p className={styles.note}>{ru.score.sponsor}</p>
    </ScreenFrame>
  );
}
