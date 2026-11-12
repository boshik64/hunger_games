import type { CharacteristicId, ItemId, OutfitId, SkillId, StrategyId } from '../game/types';

export const STEP_EVENTS = [
  'draw_start',
  'district_assigned',
  'outfit_selected',
  'skill_selected',
  'sponsor_score_shown',
  'item_selected',
  'strategy_selected',
  'game_completed',
] as const;

export const CLICK_EVENTS = [
  'replay_click',
  'share_click',
  'card_download',
  'ticket_cta_click',
] as const;

export type StepEvent = (typeof STEP_EVENTS)[number];
export type ClickEvent = (typeof CLICK_EVENTS)[number];
export type AnalyticsEvent = 'landing_view' | StepEvent | ClickEvent;

export interface AnalyticsParams {
  district?: number | null;
  item?: ItemId | null;
  strategy?: StrategyId | null;
  result?: CharacteristicId | null;
  attempt?: number;
  active_time_ms?: number;
  screen?: 'draw' | 'result';
  outfit?: OutfitId | null;
  skill?: SkillId | null;
  score?: number | null;
  skills?: SkillId[];
}
