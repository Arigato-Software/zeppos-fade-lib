import { getText } from '@zos/i18n'
import * as Styles from 'zosLoader:./index.[pf].layout.js'
import { createWidget, widget } from '@zos/ui'
import { exit } from '@zos/router'

// Подключение библиотеки
import { Fade } from '../libs/fade'

Page({
  build() {
    
    // Отрисовка элементов экрана

    createWidget(widget.TEXT, {
      ...Styles.TITLE_STYLE,
      text: 'TITLE EXAMPLE'
    });

    createWidget(widget.IMG, {
      ...Styles.IMG_STYLE,
      src: 'icon.png'
    });

    createWidget(widget.BUTTON, {
      ...Styles.BUTTON_STYLE,
      text: 'Exit',
      click_func: () => {
        fade.out({ // Плавное затухание экрана
          complete_func: () => exit() // Функция, вызываемая после завершения анимации
        });
      }
    });

    // Создание объекта fade
    const fade = new Fade();
    
    // Эффект плавного появления экрана
    fade.in(); 

  }
})
