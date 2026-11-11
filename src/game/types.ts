export type Screen = 'draw' | 'item' | 'strategy' | 'result';
export type ItemId = 'flask' | 'rope' | 'medkit';
export type StrategyId = 'risk' | 'careful';
export type CharacteristicId = 'strategist' | 'daredevil' | 'tactician' | 'survivor';

export interface GameState {
  screen: Screen;
  /** 1..12. Cleared when the guest starts the test again. */
  district: number | null;
  /** The draw reveal has finished. */
  drawn: boolean;
  /** Draw animation is running. Not persisted. */
  isDrawing: boolean;
  /** Confirmed item. */
  item: ItemId | null;
  /** Confirmed strategy. */
  strategy: StrategyId | null;
  /** Highlighted item, not yet confirmed. Not persisted. */
  pendingItem: ItemId | null;
  /** Highlighted strategy, not yet confirmed. Not persisted. */
  pendingStrategy: StrategyId | null;
  /** Blocks repeat input during the strategy → result shift. Not persisted. */
  isTransitioning: boolean;
  /** District seal shown while the step changes. Not persisted. */
  sealDistrict: number | null;
  /** Bumps on every step change so the seal can play again. Not persisted. */
  sealTick: number;
  /** 1, 2, 3… within the browser session. */
  attempt: number;
  /** Attempts that already reached the result, for game_completed dedupe. */
  completedAttempts: number[];
  /** Active time of the current attempt, excluding hidden-tab time. */
  activeTimeMs: number;
  sessionId: string;
}

export interface GameActions {
  startDraw: () => void;
  finishDraw: () => void;
  prepare: () => void;
  selectItem: (item: ItemId) => void;
  confirmItem: () => void;
  selectStrategy: (strategy: StrategyId) => void;
  confirmStrategy: () => void;
  endTransition: () => void;
  replay: () => void;
  addActiveTime: (ms: number) => void;
}

export type GameStore = GameState & GameActions;
