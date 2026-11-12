import { describe, expect, it } from 'vitest';
import { DISTRICTS } from './districts';
import { ru } from './ru';

function channel(value: number): number {
  const scaled = value / 255;
  return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

function contrastWithWhite(hex: string): number {
  const rgb = Number.parseInt(hex.slice(1), 16);
  const luminance =
    0.2126 * channel((rgb >> 16) & 255) +
    0.7152 * channel((rgb >> 8) & 255) +
    0.0722 * channel(rgb & 255);
  return (1 + 0.05) / (luminance + 0.05);
}

describe('copy', () => {
  it('keeps the screen strings from the brief', () => {
    expect(ru.draw.title).toBe('Твоё имя назвали');
    expect(ru.draw.subtitle).toBe(
      'Узнай свой дистрикт, выбери снаряжение и пройди испытание на арене',
    );
    expect(ru.draw.caption).toBe('Около минуты. Без регистрации');
    expect(ru.draw.action).toBe('Вытянуть жребий');
    expect(ru.draw.prepare).toBe('Подготовиться');
    expect(ru.tickets).toBe('Выбрать сеанс');

    expect(ru.item.title).toBe('Что возьмёшь с собой на арену?');
    expect(ru.item.caption).toBe('Выбери один предмет. Он пригодится в испытании');
    expect(ru.item.continue).toBe('Продолжить');
    expect(ru.item.options.flask).toEqual({
      name: 'Фляга',
      text: 'Поможет сохранить силы в пути',
    });
    expect(ru.item.options.rope).toEqual({
      name: 'Верёвка',
      text: 'Поможет преодолеть препятствия',
    });
    expect(ru.item.options.medkit).toEqual({
      name: 'Аптечка',
      text: 'Поможет справиться с последствиями риска',
    });

    expect(ru.strategy.title).toBe('Туман приближается. Решай быстро');
    expect(ru.strategy.situation).toBe(
      'До укрытия два пути: короткий через овраг и длинный через лес. Какой выберешь?',
    );
    expect(ru.strategy.confirm).toBe('Узнать свою судьбу');
    expect(ru.strategy.options.risk.name).toBe('Рискну — через овраг');
    expect(ru.strategy.options.risk.text).toBe('Быстрее, но придётся преодолеть препятствие');
    expect(ru.strategy.options.careful.name).toBe('Осторожно — через лес');
    expect(ru.strategy.options.careful.text).toBe('Дольше, зато без опасного прыжка');

    expect(ru.result.title).toBe('Ты прошёл испытание');
    expect(ru.result.bridge).toBe(
      'Своё испытание ты прошёл. Теперь узнай, через что прошёл Хеймитч',
    );
    expect(ru.result.share).toBe('Поделиться результатом');
    expect(ru.download).toBe('Скачать карточку');
    expect(ru.result.replay).toBe('Пройти ещё раз');

    expect(ru.share.text).toBe('Узнай свой дистрикт и проверь, как пройдёшь испытание на арене');
    expect(ru.share.copyLink).toBe('Скопировать ссылку');
    expect(ru.share.error).toBe('Не удалось подготовить карточку. Попробуй ещё раз');
    expect(ru.share.retry).toBe('Повторить');

    expect(ru.characteristics.strategist).toEqual({
      name: 'Стратег',
      phrase: 'Ты заранее готовишься к возможным трудностям.',
    });
    expect(ru.characteristics.daredevil).toEqual({
      name: 'Смельчак',
      phrase: 'Ты готов рискнуть, чтобы оказаться впереди.',
    });
    expect(ru.characteristics.tactician).toEqual({
      name: 'Тактик',
      phrase: 'Ты находишь решение прямо по ходу испытания.',
    });
    expect(ru.characteristics.survivor).toEqual({
      name: 'Выживальщик',
      phrase: 'Ты умеешь адаптироваться и сохранять силы.',
    });

    expect(ru.service.linkCopied).toBe('Ссылка скопирована');
    expect(ru.service.linkCopyFailed).toBe('Не удалось скопировать ссылку');
    expect(ru.service.saveHint).toBe('Нажми и удерживай картинку, чтобы сохранить');
    expect(ru.service.selected).toBe('Выбрано');
    expect(ru.service.progressStep(2)).toBe('Шаг 2 из 7');
  });

  it('lists 12 placeholder districts with AA accents', () => {
    expect(DISTRICTS).toHaveLength(12);
    const accents = new Set<string>();
    for (const district of DISTRICTS) {
      expect(district.id).toBeGreaterThanOrEqual(1);
      expect(district.title).toBe(`Дистрикт ${district.id}`);
      expect(district.symbolAssetId).toBe(`district.symbol.${district.id}`);
      expect(district.isPlaceholder).toBe(true);
      expect(district.tagline.length).toBeGreaterThan(0);
      expect(contrastWithWhite(district.accent)).toBeGreaterThanOrEqual(4.5);
      accents.add(district.accent);
    }
    expect(accents.size).toBe(12);
  });
});
