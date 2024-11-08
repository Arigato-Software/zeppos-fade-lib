/**
 * Fade - эффект затухания экрана
 * Version 1.0
 * Arigato Software, 2024
 */

/*
const fade = new Fade(params = {}); - создание объекта
params:
  color: 0x000000 - цвет затемнения
  container: null - применять ко всему экрану или к контейнеру

fade.in(param = {}) - появление экрана
param:
  duration: 1000 - продолжительность появления экрана (мс)
  complete_func: null - функция, вызываемая после завершения анимации

fade.out(param = {}) - затухание экрана
param - см. fade.in()

P.S. В момент анимации экран заблокирован (как элементы экрана, так и прокрутка)
*/

import { createWidget, widget, prop, deleteWidget } from '@zos/ui'
import { setScrollLock } from '@zos/page'

export class Fade {

    constructor(params = {}) {
        this.params = {
            color: 0x000000,
            container: null,
            ...params
        };
        this.myContainer = this.params.container ? false : true;
        this.rect = null;
    }

    in(param = {}) {
        const params = this.getParams(param);
        this.anim(255, 0, params.duration, () => {
            this.deleteWidgets();
            params.complete_func?.();
        });
    }

    out(param = {}) {
        const params = this.getParams(param);
        this.anim(0, 255, params.duration, () => {
            params.complete_func?.();
        });
    }

    getParams(param) {
        return {
            duration: 1000,
            complete_func: null,
            ...param,
        };
    }

    deleteWidgets() {
        deleteWidget(this.rect);
        this.rect = null;
        if (this.myContainer) {
            deleteWidget(this.params.container);
            this.params.container = null;
        }
    }

    drawRect(alpha) {
        this.drawContainer();
        const { w, h, pos_y } = this.params.container.getProperty(prop.MORE, {});
        const param = {
            x: 0,
            y: -pos_y,
            w: w,
            h: h,
            color: this.params.color,
            alpha: alpha
        };
        if (this.rect) {
            this.rect.setProperty(prop.MORE, param);
        } else {
            this.rect = this.params.container.createWidget(widget.FILL_RECT, param);
        }
    }

    drawContainer() {
        if (this.myContainer && !this.params.container) {
            this.params.container = createWidget(widget.VIEW_CONTAINER, { z_index: 9999999 });
        }
    }

    anim(from, to, duration, complete_func) {
        this.drawRect(from);
        setScrollLock({ lock: true });
        this.animTimer(from, to, duration, complete_func); // Анимация через таймер
    }

    // Это полностью рабочая функция затухания экрана через виджет анимации
    // Однако виджет анимации далеко не на всех моделях часов работает корректно
    // А потому предпочтительнее пока использовать таймер
    // В будущем, если виджет анимации заработает везде, можно использовать эту функцию
    animAnim(from, to, duration, complete_func) {
        const step = {
            anim_rate: 'linear',
            anim_duration: duration,
            anim_from: from,
            anim_to: to,
            anim_prop: prop.ALPHA
        };
        this.rect.setProperty(prop.ANIM, {
            anim_steps: [step],
            anim_fps: 25,
            anim_complete_func: () => this.complete({ complete_func: complete_func })
        });
    }

    // Анимация через таймер - костыль вместо нормальной функции анимации
    animTimer(from, to, duration, complete_func) {
        const dist = Math.abs(from - to);
        const delay = 40; // Задержка 40 мс, что обеспечивает 25 fps
        const steps = duration / delay; // Число шагов анимации
        const inc = dist / steps; // Инкремент
        const sign = from < to ? 1 : -1; // Направление движения
        let current = from; // Текущее значение
        const interval = setInterval(() => {
            if (Math.abs(to - current) <= inc) {
                clearInterval(interval);
                this.rect.setAlpha(to);
                this.complete({ complete_func: complete_func });
            } else {
                current += sign * inc;
                this.rect.setAlpha(Math.floor(current));
            }
        }, delay);
    }

    complete(param) {
        setScrollLock({ lock: false });
        param.complete_func?.();
    }

}