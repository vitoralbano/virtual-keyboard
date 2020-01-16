VirtualKeyboard = 
{
  target: null, // Target text input 
  heldKey: null, // Target key held
  timeHoldEvent: 40,
  timerId: null,
  timeHeld: 0,
  mode: '',
  
  config: {
    id: 'vtkb', // ID used at the HTML keyboard element 
    cssPrefix: 'vtkb', // CSS prefix for css classes
    keyboard: null, // HTML element holding the keyboard
    modes: {
      STANDARD: 'standard',
      SYMBOL: 'symbol',
      EMAIL: 'email'
    },
    capslock: false,
    shiftmode: false,
  },


  aux: {
    patternSpecialKeys: /^(key|mode|func)\-([a-z]+)/,
    keyDownClass: 'key-down',
  },
  
  events: {
    keyHoldEvent: new CustomEvent('keyhold')
  },
  
  input: {
    mode: { // Input mode
      // Default keys, separated into rows
      standard: [
        ['@', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'key-backspace'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
        ['func-caps','a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç', '\'', 'key-return'],
        ['func-shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', ';','func-shift'],
        ['mode-standard', 'key-spacebar', 'mode-symbol'],
      ],
      
      // Symbol keys
      symbol: [
        ['!', '@', '#', '$', '%', '¬', '&', '*', '_', '-', '+', '=', 'key-backspace'],
        ['~', '`', '^', '£', '€', '¥', '§', '[', ']', '{', '}', '(', ')',],
        ['•', '¡', '!', '¿', '?', '|', '\\', '/','\'', '"'],
        ['ª', 'º', '«', '»', ':',';', '<', '>'],
        ['mode-standard', 'key-spacebar', 'mode-symbol'],

      ],
      
      // E-mail
      email: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'key-backspace'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '-', '+'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '_', '@'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.','.com', '.br']
      ],        
    },
    
    // Characters with diacritics appear when certain keys are held
    diacritics: {
      a: 'ãáâàåæä',
      c: 'ç©',
      d: 'ð',
      e: 'ëéêè',
      i: 'íîìï',
      m: 'µ',
      n: 'ñ',
      o: 'óôõòøö',
      u: 'úùüû',
      y: 'ÿý',
    },      
    
    keys: {
      
      backspace: {
        value: 'key-backspace',
        key: '⌦'
      },
      
      caps: {
        value: 'func-caps',
        key: 'Caps'
      },
      
      confirm: {
        value: 'key-confirm',
        key: '>'
      }, 

      confirm: {
        value: 'mode-email',
        key: 'Email'
      },       
      
      return: {
        value: String.fromCharCode(10),
        key: '↵'
      },
      
      shift: {
        value: 'func-shift',
        key: '⇧'
      },
            
      spacebar: {
        value: ' ',
        key: ' '
      },

      standard: {
        value: 'mode-standard',
        key: 'Abc'
      },

      symbol: {
        value: 'mode-symbol',
        key: '!@#'
      },
      
      tab: {
        value: 'key-tab',
        key: 'Tab'
      }
      
    }
  },
  
  init() {
    console.log('VirtualKeyboard INIT', this.config);
    this.config.keyboard = document.querySelector(`#${this.config.id}`);
    
    if (!this.config.keyboard) {
      this.config.keyboard = document.createElement('div');
      this.config.keyboard.id = this.config.id;
      this.target = this.keyboard;
      document.body.appendChild(this.config.keyboard);
    }
    
    this.createKeyboardModes();
    this.addInputListeners();
    // this.selectMode(this.config.modes[0]);
    
  },
  
  
  createKeyboardModes() {
    this.config.modes = Object.keys(this.input.mode);
    
    this.config.modes.forEach(mode => {
      let modeKeys = this.input.mode[mode];
      this.config.keyboard.appendChild(this.createKeyboard(mode, modeKeys));
    });
  },
  
  
  createKeyboard(mode, keys) {
    let keyboardMode = document.createElement('div');
    keyboardMode.id = `${this.config.cssPrefix}-mode-${mode}`;
    keyboardMode.classList.add('flex-column', 'justify-content-center', 'd-none', `${this.config.cssPrefix}-mode`);
    const specialKeys = Object.keys(this.input.keys);
    
    keys.forEach(row => { // Create keyboard rows
      let keysRow = document.createElement('div');
      keysRow.classList.add('d-flex', 'flex-row', 'justify-content-center', `${this.config.cssPrefix}-row`);

      row.forEach(keyValue => {
        let key = VirtualKeyboard.createKey(keyValue);
        keysRow.appendChild(key);

        VirtualKeyboard.addKeyListeners(key);
        
        if(VirtualKeyboard.input.diacritics.hasOwnProperty(keyValue))
        {
          key.classList.add(`${VirtualKeyboard.config.cssPrefix}-has-diacritics`);
          key.addEventListener('keyhold', VirtualKeyboard.keyHold);
          VirtualKeyboard.createDiacritics(key);
        }
      });
        
      keyboardMode.appendChild(keysRow);
    });
      
    return keyboardMode;
  },

  createKey(value) {
    let key = document.createElement('div');
    let span = document.createElement('span');
    let keyText = value;
    let match = this.aux.patternSpecialKeys.exec(value);
    
    if (match) {
      keyText = this.input.keys.hasOwnProperty(match[2]) ? 
        this.input.keys[match[2]].key : 
        value;
    } 

    key.classList.add('btn', `${VirtualKeyboard.config.cssPrefix}-key`);        
    key.setAttribute('data-vtkb-key', value);
    span.innerHTML = keyText;
    key.appendChild(span);
    
    return key;
  },

  addKeyListeners(key) {
    key.addEventListener('pointerdown', VirtualKeyboard.keyDown);
    key.addEventListener('pointerout', VirtualKeyboard.keyOut);
    key.addEventListener('pointerup', VirtualKeyboard.keyUp);
    key.addEventListener('contextmenu', function(event) { event.preventDefault(); });

  },


  createDiacritics(key) {
    let character = key.getAttribute('data-vtkb-key');

    if(this.input.diacritics.hasOwnProperty(character)) 
    {
      let diacriticsChars = this.input.diacritics[character].split('');
      let diacritics = document.createElement('div');
      diacritics.classList.add('vtkb-diacritics');

      diacriticsChars.forEach(function(value) {
        let diacritic = VirtualKeyboard.createKey(value);
        
        diacritics.append(diacritic);
        VirtualKeyboard.addKeyListeners(diacritic);
      });

      key.appendChild(diacritics);
    }
  },
    
    
  addInputListeners() {
    const inputs = document.querySelectorAll('input[type="text"], textarea');
    
    Array.prototype.forEach.call(inputs, input => {
      input.addEventListener('focus', e => {
        VirtualKeyboard.setTarget(e.target);
      });
    });
  },
    
    
  setTarget(target) {
    if(target) {
      this.target = target;
      this.selectMode(target.getAttribute(`data-${this.config.id}-mode`));
    }
  },
  
    
  selectMode(mode) {
    mode = mode || this.config.modes[0];
    this.mode = mode;
    
    const modes = document.querySelectorAll(`[id^='${this.config.id}-mode'`);
    Array.prototype.forEach.call(modes, element => {
      element.classList.add('d-none');
    });
    
    const selectMode = document.querySelector(`#${this.config.id}-mode-${mode}`);
    if (selectMode) {
      selectMode.classList.remove('d-none');
    }
  },
    
  keyDown(event) {

    event.stopImmediatePropagation();
    event.currentTarget.classList.add(VirtualKeyboard.aux.keyDownClass);
    VirtualKeyboard.aux.heldKey = event.currentTarget;

    if(event.currentTarget.classList.contains(`${VirtualKeyboard.config.cssPrefix}-has-diacritics`)) 
    {
      VirtualKeyboard.heldKey = event.currentTarget;
      requestAnimationFrame(VirtualKeyboard.holdTimer);
    }

    event.currentTarget.classList.remove('vtkb-hold');


    event.preventDefault();
  },

  keyUp(event) {

    event.stopImmediatePropagation();
    event.target.classList.remove(VirtualKeyboard.aux.keyDownClass);
    cancelAnimationFrame(VirtualKeyboard.timerId);
    VirtualKeyboard.timeHeld = 0;
    event.preventDefault();

    if(!event.target.classList.contains('vtkb-hold') && (event.type != 'pointerout')) 
    {
      const match = VirtualKeyboard.aux.patternSpecialKeys.exec(event.currentTarget.getAttribute('data-vtkb-key'));
      if (match) 
      {
        switch (match[1]) 
        {
          case 'key':
            VirtualKeyboard.inputData(VirtualKeyboard.input.keys[match[2]].value);
          break;
          
          case 'func':
            VirtualKeyboard.keyboardFunction(match[0]);
          break;
  
          case 'mode':
            VirtualKeyboard.selectMode(match[2]);
          break;
        
        }
      } else {
        VirtualKeyboard.inputData(event.currentTarget.getAttribute(`data-${VirtualKeyboard.config.id}-key`));
      }
      event.currentTarget.classList.remove('vtkb-keydown');
      VirtualKeyboard.closeDiacritics();
    }
  },


  keyOut(event) {
    event.currentTarget.classList.remove(VirtualKeyboard.aux.keyDownClass);
  },

  holdTimer() {
    if(VirtualKeyboard.timeHeld < VirtualKeyboard.timeHoldEvent) 
    {
      VirtualKeyboard.timerId = requestAnimationFrame(VirtualKeyboard.holdTimer);
      VirtualKeyboard.timeHeld++;
    } else {
      cancelAnimationFrame(VirtualKeyboard.timerId);
      VirtualKeyboard.timeHeld = 0;
      VirtualKeyboard.heldKey.dispatchEvent(VirtualKeyboard.events.keyHoldEvent);
    }

  },

  keyHold(event) {
    if(VirtualKeyboard.heldKey.classList.contains('vtkb-has-diacritics')) 
    {
      VirtualKeyboard.closeDiacritics();
      VirtualKeyboard.heldKey.classList.add('vtkb-hold');
    }
  },
  
  inputData(value) {
    if (VirtualKeyboard.target) {
      const target = VirtualKeyboard.target;
      let selectionPosition = Math.min(target.selectionStart, target.selectionEnd);
      
      switch (value) {
        case VirtualKeyboard.input.keys.backspace.value:
          if(target.selectionStart != target.selectionEnd) {
            target.setRangeText('');
          } else if(target.selectionEnd > 0) {
            target.setRangeText('', target.selectionEnd - 1, target.selectionEnd);
            selectionPosition -= 1;
          }

          if(this.shiftmode) { this.toggleShift(); }
        break;
        
        default:
          value = ((this.capslock && !this.shiftmode) || (!this.capslock && this.shiftmode)) && this.mode != 'email' ? String(value).toUpperCase() : String(value).toLowerCase();
          target.setRangeText(`${value}`);
          selectionPosition += value.length;
        break;
      }
      
      selectionPosition = Math.max(selectionPosition, 0);
      
      target.selectionStart = selectionPosition;
      target.selectionEnd = selectionPosition;
      target.focus();
      if(this.shiftmode) {
        this.toggleShift();
      }
    }
  },

  keyboardFunction(func) {
    switch (func) {
      case VirtualKeyboard.input.keys.shift.value:
        this.toggleShift();
      break;

      case VirtualKeyboard.input.keys.caps.value:
        this.toggleCapslock();
      break;
    }
  },

  toggleShift() {
    VirtualKeyboard.shiftmode = !VirtualKeyboard.shiftmode;
    VirtualKeyboard.shiftmode ? this.config.keyboard.classList.add('shiftmode') : this.config.keyboard.classList.remove('shiftmode');
  },

  closeDiacritics() {
    let openDiacritics = document.querySelectorAll('.vtkb-has-diacritics.vtkb-hold');

    if(openDiacritics.length) {
      Array.prototype.forEach.call(openDiacritics, 
        function(element) {
          element.classList.remove('vtkb-hold');
      });
    }
  },

  toggleCapslock() {
    VirtualKeyboard.capslock = !VirtualKeyboard.capslock;
    VirtualKeyboard.capslock ? this.config.keyboard.classList.add('capslock') : this.config.keyboard.classList.remove('capslock');
  },
  
  // Key value type 
  keyType(char) {
    // TO-DO Implementar outros tipos de caractere
    return isNaN(parseFloat(char)) ? 'char' : 'number';
  }
    
    
}
  
  