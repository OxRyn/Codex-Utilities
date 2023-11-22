const { Schema, model } = require("mongoose");

const biteCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  BiteCount: Number,
});

const blushedCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  BlushedCount: Number,
});

const bonkCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  BonkCount: Number,
});

const bullyCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  BullyCount: Number,
});

const cuddleCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  CuddleCount: Number,
});

const cryCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  CryCount: Number,
});

const danceCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  DanceCount: Number,
});

const diceSchema = new Schema({
  Guild: String,
  MemberId: String,
  DiceRollCount: Number,
});

const eightballCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  EightballCount: Number,
});

const handholdCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  HandholdCount: Number,
});

const highfiveCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  HighfiveCount: Number,
});

const hugCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  HugCount: Number,
});

const killCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  KillCount: Number,
});

const kissCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  KissCount: Number,
});

const lickCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  LickCount: Number,
});

const nomCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  NomCount: Number,
});

const patCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  PatCount: Number,
});

const pokeCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  PokeCount: Number,
});

const smileCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  SmileCount: Number,
});

const smugCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  SmugCount: Number,
});

const winkCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  WinkCount: Number,
});

const waveCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  WaveCount: Number,
});

const yeetCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  YeetCount: Number,
});

const slapCountSchema = new Schema({
  Guild: String,
  MemberId: String,
  SlapCount: Number,
});

// Models
const BiteCount = model("biteCount", biteCountSchema);
const BlushedCount = model("blushedCount", blushedCountSchema);
const BonkCount = model("bonkCount", bonkCountSchema);
const BullyCount = model("bullyCount", bullyCountSchema);
const CuddleCount = model("cuddleCount", cuddleCountSchema);
const CryCount = model("cryCount", cryCountSchema);
const DanceCount = model("danceCount", danceCountSchema);
const Dice = model("dice", diceSchema);
const EightballCount = model("eightballCount", eightballCountSchema);
const HandholdCount = model("handholdCount", handholdCountSchema);
const HighfiveCount = model("highfiveCount", highfiveCountSchema);
const HugCount = model("hugCount", hugCountSchema);
const KillCount = model("killCount", killCountSchema);
const KissCount = model("kissCount", kissCountSchema);
const LickCount = model("lickCount", lickCountSchema);
const NomCount = model("nomCount", nomCountSchema);
const PatCount = model("patCount", patCountSchema);
const PokeCount = model("pokeCount", pokeCountSchema);
const SmileCount = model("smileCount", smileCountSchema);
const SmugCount = model("smugCount", smugCountSchema);
const WinkCount = model("winkCount", winkCountSchema);
const WaveCount = model("waveCount", waveCountSchema);
const YeetCount = model("yeetCount", yeetCountSchema);
const SlapCount = model("slapCount", slapCountSchema);

module.exports = {
  BiteCount,
  BlushedCount,
  BonkCount,
  BullyCount,
  CuddleCount,
  CryCount,
  DanceCount,
  Dice,
  EightballCount,
  HandholdCount,
  HighfiveCount,
  HugCount,
  KillCount,
  KissCount,
  LickCount,
  NomCount,
  PatCount,
  PokeCount,
  SmileCount,
  SmugCount,
  WinkCount,
  WaveCount,
  YeetCount,
  SlapCount,
};
