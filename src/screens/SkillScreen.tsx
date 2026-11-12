import { useEffect } from 'react';
import { ActionButton } from '../components/ActionButton';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { ScreenFrame } from '../components/ScreenFrame';
import { ru } from '../content/ru';
import type { SkillId } from '../game/types';
import { useGameStore } from '../game/store';
import styles from '../app/shell.module.css';

export function SkillScreen() {
  const offeredSkills = useGameStore((state) => state.offeredSkills);
  const skill = useGameStore((state) => state.skill);
  const pendingSkill = useGameStore((state) => state.pendingSkill);
  const selectSkill = useGameStore((state) => state.selectSkill);
  const confirmSkill = useGameStore((state) => state.confirmSkill);
  const revealScore = useGameStore((state) => state.revealScore);
  const ensureSkills = useGameStore((state) => state.ensureSkills);

  useEffect(() => {
    ensureSkills();
  }, [ensureSkills]);

  useEffect(() => {
    if (!skill) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => revealScore(), reduce ? 0 : 1400);
    return () => window.clearTimeout(timeout);
  }, [skill, revealScore]);

  if (skill) {
    return (
      <ScreenFrame title={ru.skill.options[skill].name} actions={null}>
        <p className={styles.lede}>{ru.skill.situation}</p>
      </ScreenFrame>
    );
  }

  const skillArt: Record<SkillId, string> = {
    bullseye: 'still.skill.bullseye',
    vanish: 'still.skill.vanish',
    mockingjay: 'still.skill.mockingjay',
    balance: 'still.skill.balance',
    memory: 'still.skill.memory',
    laugh: 'still.skill.laugh',
  };
  const options = offeredSkills.map((id) => ({
    id,
    name: ru.skill.options[id].name,
    text: ru.skill.options[id].comment,
    assetId: skillArt[id],
  }));

  return (
    <ScreenFrame
      title={ru.skill.title}
      actions={
        <ActionButton variant="primary" disabled={pendingSkill == null} onClick={confirmSkill}>
          {ru.skill.confirm}
        </ActionButton>
      }
    >
      <p className={styles.lede}>{ru.skill.situation}</p>
      <ChoiceGroup<SkillId>
        label={ru.skill.situation}
        options={options}
        value={pendingSkill}
        columns={3}
        layout="tiles"
        onChange={selectSkill}
      />
    </ScreenFrame>
  );
}
