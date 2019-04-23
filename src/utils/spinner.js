import ora from 'ora';
import {verbose} from './log';

const spinner = {
  _spinner: null,
  start(txt) {
    if(verbose) this._spinner = ora().start(txt);
  },
  step(txt) {
    if(this._spinner) this._spinner.text = txt;
  },
  clear() {
    if(this._spinner) this._spinner.clear();
  },
  stop() {
    if(this._spinner) this._spinner.clear().stop();
  },
  succeed(txt) {
    if(this._spinner) this._spinner.clear().succeed(txt);
  },
  fail(txt) {
    if(this._spinner) this._spinner.clear().fail(txt);
  }
}

export default spinner;