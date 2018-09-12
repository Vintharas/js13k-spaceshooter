class HarmonicSynth {
  private masterGain: GainNode;
  private partials: OscillatorNode[] = [];
  private partialGains: GainNode[] = [];

  constructor(private ac: AudioContext, private partialAmplitudes: any[]) {
    this.masterGain = Gain(ac, 0.3);
    this.setupGains();
  }

  setupOscillators() {
    this.partials = this.partialAmplitudes.map(() => Oscillator(this.ac));

    this.partialAmplitudes.forEach((amp, index) => {
      this.partials[index].connect(this.partialGains[index]);
    });
  }

  setupGains() {
    this.partialGains = this.partialAmplitudes.map(amplitude =>
      Gain(this.ac, amplitude)
    );
    this.partialAmplitudes.forEach((amp, index) => {
      this.partialGains[index].connect(this.masterGain);
    });
  }

  connect(dest: AudioNode) {
    this.masterGain.connect(dest);
  }

  disconnect() {
    this.masterGain.disconnect();
  }

  start(time = 0) {
    this.setupOscillators();
    this.partials.forEach(o => o.start(time));
  }

  stop(time = 0) {
    this.partials.forEach(o => o.stop(time));
  }

  setFrequencyAtTime(frequency: number, time: number) {
    this.partials.forEach((o, index) => {
      o.frequency.setValueAtTime(frequency * (index + 1), time);
    });
  }

  exponentialRampToFrequencyAtTime(frequency: number, time: number) {
    this.partials.forEach((o, index) => {
      if (frequency > 0)
        o.frequency.exponentialRampToValueAtTime(frequency * (index + 1), time);
    });
  }

  set onended(callback: any) {
    this.partials[0].onended = callback;
  }
}

// duration, quarter note = 1, half note = 0.5, etc
interface Note {
  freq: number;
  duration: number;
}
function Note(freq: number, duration: number): Note {
  return { freq, duration };
}

// tempo = beats per minute for this particular sequence
function Sequence(
  ac: AudioContext,
  notes: Note[],
  { tempo = 120, loop = false } = {}
) {
  let synth = new HarmonicSynth(ac, [1, 0.1, 0.2, 0.5]);
  return {
    start(when = ac.currentTime) {
      synth.start(when);
      notes.forEach(note => {
        when = this.scheduleNote(note, when);
      });
      synth.stop(when);
      synth.onended = loop ? this.start.bind(this, when) : undefined;
    },
    scheduleNote(note: Note, when: number) {
      synth.setFrequencyAtTime(note.freq, when);
      let duration = (60 / tempo) * note.duration;
      return when + duration;
    },
    stop(when = 0) {
      synth.onended = undefined;
      synth.stop(when);
    },
    connect(node: AudioNode) {
      synth.connect(node);
    }
  };
}

/*
// use ramps?
synth.setFrequencyAtTime(G4, t + 0.95);
synth.exponentialRampToFrequencyAtTime(A4, t + 1);
synth.setFrequencyAtTime(A4, t + 1.95);
*/

function Oscillator(ac: AudioContext, freq = 0) {
  let osc = ac.createOscillator();
  osc.frequency.value = freq;
  return osc;
}

function Gain(ac: AudioContext, gainValue: number) {
  let gain = ac.createGain();
  gain.gain.value = gainValue;
  return gain;
}

interface Connectable {
  connect(n: AudioNode): void;
}
function Beating(
  ac: AudioContext,
  freq1: number,
  freq2: number,
  gainValue: number
) {
  let osc1 = Oscillator(ac, freq1);
  let osc2 = Oscillator(ac, freq2);
  let gain = Gain(ac, gainValue);
  osc1.connect(gain);
  osc2.connect(gain);
  return {
    connect(n: AudioNode) {
      gain.connect(n);
    },
    start(when = 0) {
      osc1.start(when);
      osc2.start(when);
    },
    stop(when = 0) {
      osc1.stop(when);
      osc2.stop(when);
    }
  };
}

function Connect({ to }: { to: AudioNode }, ...nodes: Connectable[]) {
  nodes.forEach(n => n.connect(to));
}

interface MusicTrack {
  start(): void;
  stop(): void;
}

function GameOpeningMusic(ac: AudioContext): MusicTrack {
  let b1 = Beating(ac, 330, 330.2, 0.5);
  let b2 = Beating(ac, 440, 440.33, 0.5);
  let b3 = Beating(ac, 587, 587.25, 0.5);
  let masterGain = Gain(ac, 0.1);

  Connect({ to: masterGain }, b1, b2, b3);
  masterGain.connect(ac.destination);

  return {
    start() {
      b1.start();
      b2.start();
      b3.start();
    },
    stop() {
      b1.stop();
      b2.stop();
      b3.stop();
    }
  };
}

function SpaceMusic(ac: AudioContext): MusicTrack {
  let G4 = 440 * Math.pow(2, -2 / 12);
  let A4 = 440;
  let F4 = 440 * Math.pow(2, -4 / 12);
  let F3 = 440 * Math.pow(2, -16 / 12);
  let C4 = 440 * Math.pow(2, -9 / 12);

  let seq = Sequence(
    ac,
    [
      Note(G4, 1),
      Note(A4, 0.5),
      Note(F4, 0.5),
      Note(F3, 1),
      Note(C4, 2),

      Note(0, 1),

      Note(G4, 1),
      Note(A4, 0.5),
      Note(F4, 0.5),
      Note(F3, 1),
      Note(A4, 2)
    ],
    { loop: true }
  );
  let seq2 = Sequence(
    ac,
    [
      Note(0, 1),
      Note(0, 0.5),
      Note(0, 0.5),
      Note(G4, 1),
      Note(0, 2),

      Note(0, 1),

      Note(0, 1),
      Note(0, 0.5),
      Note(0, 0.5),
      Note(0, 1),
      Note(0, 2)
    ],
    { loop: true }
  );

  let b1 = Beating(ac, 330, 330.2, 0.5);
  let b2 = Beating(ac, 440, 440.33, 0.5);
  let b3 = Beating(ac, 587, 587.25, 0.5);
  let masterGain = Gain(ac, 0.1);

  Connect({ to: masterGain }, b1, b2, b3);
  masterGain.connect(ac.destination);

  let gainSynth = Gain(ac, 0.5);
  seq.connect(gainSynth);
  seq2.connect(gainSynth);
  gainSynth.connect(ac.destination);

  return {
    start() {
      b1.start();
      b2.start();
      b3.start();
      seq.start();
      seq2.start();
    },
    stop() {
      b1.stop();
      b2.stop();
      b3.stop();
      seq.stop();
      seq2.stop();
    }
  };
}

export const enum Track {
  Opening,
  Space
}

export interface GameMusic {
  play(track: Track): void;
  stop(): void;
  currentTrack: MusicTrack;
}

export function GameMusic(): GameMusic {
  let ac = new AudioContext();

  return {
    currentTrack: undefined,
    play(track: Track) {
      if (this.currentTrack) {
        this.currentTrack.stop();
      }
      let musicTrack = Tracks[track];
      this.currentTrack = musicTrack(ac);
      this.currentTrack.start();
    },
    stop() {
      this.currentTrack.stop();
    }
  };
}

interface Tracks {
  [key: number]: (ac: AudioContext) => MusicTrack;
}
const Tracks: Tracks = {
  [Track.Opening]: GameOpeningMusic,
  [Track.Space]: SpaceMusic
};
