const C_VER = {{{cat-ver}}};

var fandom, unit_buy, skill_file, SkillLevel, anim1, _eggs, enemy_descs, obtainid, rwMap, tfMap, def_lv, plus_lv, my_curve, _info;
var unit_orbs, orb_massive = 0, orb_resist = 1, orb_good_atk = 0, orb_good_hp = 1;

const 
  // attack types
  ATK_SINGLE = 1, ATK_RANGE = 2, ATK_LD = 4, ATK_OMNI = 8, ATK_KB_REVENGE = 16, 
  // traits
  TB_RED = 1, TB_FLOAT = 2, TB_BLACK = 4, TB_METAL = 8, TB_ANGEL = 16, TB_ALIEN = 32, TB_ZOMBIE = 64, TB_RELIC = 128, TB_WHITE = 256, TB_EVA = 512, TB_WITCH = 1024, TB_DEMON = 2048, TB_INFN = 4096, TB_BEAST = 8192, TB_BARON = 16384, TB_SAGE = 32768, 
  // immunities
  IMU_WAVE = 1, IMU_STOP = 2, IMU_SLOW = 4, IMU_KB = 8, IMU_VOLC = 16, IMU_WEAK = 32, IMU_WARP = 64, IMU_CURSE = 128, IMU_POIATK = 256, IMU_BOSSWAVE = 512, 
  // abilities
  AB_STRONG = 1, AB_LETHAL = 2, AB_ATKBASE = 3, AB_CRIT = 4, AB_ZKILL = 5, AB_CKILL = 6, AB_BREAK = 7, AB_SHIELDBREAK = 8, AB_S = 9, AB_BOUNTY = 10, AB_METALIC = 11, AB_MINIWAVE = 12, AB_WAVE = 13, AB_MINIVOLC = 14, AB_VOLC = 15, AB_WAVES = 16, AB_BAIL = 17, AB_BSTHUNT = 18, AB_WKILL = 19, AB_EKILL = 20, AB_WEAK = 21, AB_STOP = 22, AB_SLOW = 23, AB_ONLY = 24, AB_GOOD = 25, AB_RESIST = 26, AB_RESISTS = 27, AB_MASSIVE = 28, AB_MASSIVES = 29, AB_KB = 30, AB_WARP = 31, AB_IMUATK = 32, AB_CURSE = 33, AB_BURROW = 34, AB_REVIVE = 35, AB_POIATK = 36, AB_GLASS = 37, AB_SHIELD = 38, AB_DSHIELD = 39, AB_COUNTER = 40, AB_AFTERMATH = 41, AB_SAGE = 42, AB_SUMMON = 43, AB_MK = 44,
  // resits
  RES_WEAK = 0, RES_STOP = 1, RES_SLOW = 2, RES_KB = 3, RES_WAVE = 4, RES_SURGE = 5, RES_CURSE = 6, RES_TOXIC = 7, RES_WARP = 8,
  trait_no_treasure = TB_DEMON | TB_EVA | TB_WITCH | TB_WHITE | TB_RELIC, 
  trait_treasure = TB_RED | TB_FLOAT | TB_BLACK | TB_ANGEL | TB_ALIEN | TB_ZOMBIE | TB_METAL, 
  _l_unit = localStorage.getItem("unit");
let _l_f = localStorage.getItem('prec');
if (_l_f) {
  _l_f = parseInt(_l_f);
} else {
  _l_f = 2;
}
_l_f = new Intl.NumberFormat(undefined, { 'maximumFractionDigits': _l_f });
function t3str(x) {
    var s = x.toString();
    switch (s.length) {
      case 2:
        return "0" + s;

      case 1:
        return "00" + s;
    }
    return s;
}

function numStr(num) {
  return _l_f.format(num);
  // return (Math.round(100 * (num + Number.EPSILON)) / 100).toString();
}

function numStrT(num) {
  if (_l_unit == 'F')
    return num.toString() + ' F';
  return numStr(num / 30) + ' 秒';
}

function combineChances(count, chance) {
    let x = 1;
    for (let i = 0; i < count; ++i) x *= (100 - chance) / 100;
    return 1 - x;
}

function getChances(freq, pres, chance, duration) {
    var segments = [];
    outer: for (let now = 0; ;now -= freq) for (let i = pres.length - 1; 0 <= i; --i) {
        if (!(0 <= now + pres[i] + duration)) break outer;
        var a = now + pres[i], z = Math.min(a + duration, freq);
        a != z && segments.push([ Math.max(a, 0), z ]);
    }
    var steps = [];
    let substeps = [];
    for (let i = 0; i <= freq; ++i) {
        for (var x of segments) i != x[0] && i != x[1] || (i == x[0] ? substeps.push(!0) : substeps.push(!1));
        substeps.length && (steps.push([ i, substeps ]), substeps = []);
    }
    let cover = 0, last = steps[0][0], count = 0;
    for (let x of steps) {
        var s, now = x[0];
        const substeps = x[1];
        cover += combineChances(count, chance) * (now - last) / freq;
        for (s of substeps) s ? ++count : --count;
        last = now;
    }
    return 100 * Math.min(cover, 1);
}

function getCover(p, durationF, attackF) {
    p /= 100;
    durationF /= attackF, attackF = ~~durationF, durationF -= attackF;
    return 100 * Math.min(1 - durationF * Math.pow(1 - p, 1 + attackF) - (1 - durationF) * Math.pow(1 - p, attackF), 1);
}

function getCoverUnit(unit, chance, duration) {
    if (!(unit.pre2 + unit.pre1)) return numStr(getCover(chance, duration, unit.attackF));
    var pres = [];
    for (let i = 4; 1 <= i; i >>= 1) if (unit.abi & i) switch (i) {
      case 1:
        pres.push(unit.pre2);
        break;

      case 2:
        pres.push(unit.pre1);
        break;

      case 4:
        pres.push(unit.pre);
    }
    return numStr(getChances(unit.attackF, pres, chance, duration));
}
function get_trait_short_names(trait) {
	const trait_short_names = [ "紅", "浮", "黑", "鐵", "天", "星", "死", "古", "無", "使徒", "魔女", "惡" ];
    var s = "";
    let i = 0;
    for (let x = 1; x <= TB_DEMON; x <<= 1) trait & x && (s += trait_short_names[i]), 
    i++;
    return s;
}

function useCurve(i) {
    my_curve = _curves[i];
}

function getLevelMulti(level) {
    var c, multi = .8;
    let n = 0;
    for (c of my_curve) {
        if (level <= n) break;
        multi += Math.min(level - n, 10) * (c / 100), n += 10;
    }
    return multi;
}

class Form {
    constructor(name, jp_name, desc, cat_id, level_count, data) {
        if (!data) {
            Object.assign(this, name);
            return;
        }
        if (level_count == 2)
            this.involve = enemy_descs[cat_id];
        this.desc = desc;
        this.id = cat_id;
        this.lvc = level_count;
        this.name = name;
        this.jp_name = jp_name;
        this.trait = 0;
        this.ab = {};
        this.res = {};
        this.imu = 0;
        this.price = data[6];
        this.range = data[5];
        this.hp = data[0];
        this.kb = data[1];
        this.cd = data[7] * 2;
        this.atk = data[3];
        this.atk1 = data[59] | 0;
        this.atk2 = data[60] | 0;
        this.pre = data[13];
        this.pre1 = data[61];
        this.pre2 = data[62];
        this.tba = data[4] * 2;
        this.speed = data[2];
        this.abi = 
          ((data[63] == undefined ? 1 : data[63]) << 2) + 
          ((data[64] | 0) << 1) + 
          (data[65] | 0);
        this.backswing = anim1[cat_id][level_count];
        this.attackF = (this.pre2 || this.pre1 || this.pre) + Math.max(this.backswing, this.tba - 1);
        const form_str = "fcsu"[level_count];
        const my_id_str = t3str(cat_id);
        const may_egg = _eggs[level_count];
        if (may_egg >= 0) {
            const str = t3str(may_egg);
            this.icon = `/img/s/${str}/${str}_m.png`;
        } else {
            this.icon = `/img/u/${my_id_str}/${form_str}/uni${my_id_str}_${form_str}00.png`;
        }
        data[10] && (this.trait |= TB_RED);
        data[16] && (this.trait |= TB_FLOAT);
        data[17] && (this.trait |= TB_BLACK);
        data[18] && (this.trait |= TB_METAL);
        data[19] && (this.trait |= TB_WHITE);
        data[20] && (this.trait |= TB_ANGEL);
        data[21] && (this.trait |= TB_ALIEN);
        data[22] && (this.trait |= TB_ZOMBIE);
        data[78] && (this.trait |= TB_RELIC);
        data[96] && (this.trait |= TB_DEMON);
        if (this.trait) {
            data[23] && (this.ab[AB_GOOD] = null);
            data[24] && (this.ab[AB_KB] = [ data[24] ]);
            data[25] && (this.ab[AB_STOP] = [data[25], data[26]]);
            data[27] && (this.ab[AB_SLOW] = [ data[27], data[28] ]);
            data[32] && (this.ab[AB_ONLY] = null);
            data[37] && (this.ab[AB_WEAK] = [ data[37], data[39], data[38] ]);
            data[29] && (this.ab[AB_RESIST] = null);
            data[30] && (this.ab[AB_MASSIVE] = null);
            data[80] && (this.ab[AB_RESISTS] = null);
            data[81] && (this.ab[AB_MASSIVES] = null);
            data[92] && (this.ab[AB_CURSE] = [ data[92], data[93] ]);
        }
        data[31] && (this.ab[AB_CRIT] = data[31]);
        data[33] && (this.ab[AB_BOUNTY] = null);
        data[34] && (this.ab[AB_ATKBASE] = [ 300 ]);
        data[46] && (this.imu |= IMU_WAVE);
        data[48] && (this.imu |= IMU_KB);
        data[49] && (this.imu |= IMU_STOP);
        data[50] && (this.imu |= IMU_SLOW);
        data[51] && (this.imu |= IMU_WEAK);
        data[75] && (this.imu |= IMU_WARP);
        data[56] && (this.imu |= IMU_BOSSWAVE);
        (data[58] == 2) && (this.ab[AB_GLASS] = null);
        data[79] && (this.imu |= IMU_CURSE);
        data[90] && (this.imu |= IMU_POIATK);
        data[91] && (this.imu |= IMU_VOLC);
        data[41] && (this.ab[AB_STRONG] = [ data[40], data[41] ]);
        data[42] && (this.ab[AB_LETHAL] = data[42]);
        data[43] && (this.ab[AB_METALIC] = null);
        data[47] && (this.ab[AB_WAVES] = null);
        if (data[35]) {
            if (data.length < 95 || data[94] != 1) {
                this.ab[AB_WAVE] = [ data[35], data[36] ];
            } else {
                this.ab[AB_MINIWAVE] = [ data[35], data[36] ];
            }
        }
        if (data.length >= 52) {
            data[52] && (this.ab[AB_ZKILL] = null);
            data[53] && (this.ab[AB_WKILL] = null);
            data[77] && (this.ab[AB_EKILL] = null);
            data[70] && (this.ab[AB_BREAK] = [ data[70] ]);
            let imu_atk_prob = data[84];
            let imu_atk_time = data[85];
            data[82] && (this.ab[AB_S] = [ data[82], data[83] ]);
            data[84] && (this.ab[AB_IMUATK] = [ data[84], data[85] ]);
            if (data[86]) {
                const des1 = data[87] >> 2;
                const des2 = data[87] + data[88] >> 2;
                const lv = data[89];
                const time = lv * 20;
                if (data.length >= 109 && data[108] == 1) {
                    this.ab[AB_MINIVOLC] = [ data[86], des1, des2, time, lv ];
                } else {
                    this.ab[AB_VOLC] = [ data[86], des1, des2, time, lv ];
                }
            }
            data[95] && (this.ab[AB_SHIELDBREAK] = [ data[95] ]);
            data[97] && (this.ab[AB_BAIL] = null);
            data[98] && (this.ab[AB_CKILL] = null);
            data[105] && (this.ab[AB_BSTHUNT] = [ data[106], data[107] ]);
            data[109] && (this.ab[AB_COUNTER] = null);
            (isFinite(data[110]) && data[110] != -1) && (this.ab[AB_SUMMON] = data[110]);
            data[111] && (this.ab[AB_SAGE] = null);
		 data[112] && (this.ab[AB_MK] = data[112]);
        }
        this.atkType = data[12] ? ATK_RANGE : ATK_SINGLE;
        let atkCount = this.atk1 == 0 ? 1 : this.atk2 == 0 ? 2 : 3;
        this.lds = new Array(atkCount);
        this.lds[0] = data[44];
        this.ldr = new Array(atkCount);
        this.ldr[0] = data[45];
        for (let i = 1; i < atkCount; ++i) {
            if (data[99 + (i - 1) * 3] == 1) {
                this.lds[i] = data[99 + (i - 1) * 3 + 1];
                this.ldr[i] = data[99 + (i - 1) * 3 + 2];
            } else {
                this.lds[i] = this.lds[0];
                this.ldr[i] = this.ldr[0];
            }
        }
        for (let x of this.ldr) {
            if (x < 0) {
                this.atkType |= ATK_OMNI;
                break;
            }
            if (x > 0) {
                this.atkType |= ATK_LD;
                break;
            }
        }
        if (this.tba + this.pre < this.attackF / 2) this.atkType |= ATK_KB_REVENGE;
    }
    applyTalent(talent, level) {
        if (!level) return;
        var t, x, y, z;
        level -= 1;
        const maxLv = talent[1] - 1;
        const inc1 = ~~(talent[2] + level * (talent[3] - talent[2]) / maxLv);
        const inc2 = ~~(talent[4] + level * (talent[5] - talent[4]) / maxLv);
        const inc3 = ~~(talent[6] + level * (talent[7] - talent[6]) / maxLv);
        const inc4 = ~~(talent[8] + level * (talent[9] - talent[8]) / maxLv);
        switch (talent[0]) {
          case 1:
            t = this.ab[AB_WEAK];
            x = inc2 + (t ? t[2] : 0); // duration
            y = inc1 + (t ? t[0] : 0); // chance
            z = (inc3 ? (100 - inc3) : 0) + (t ? t[1] : 0); // power
            this.ab[AB_WEAK] = [y, z, x];
            break;

          case 2:
            t = this.ab[AB_STOP];
            x = inc2 + (t ? t[1] : 0); // duration
            y = inc1 + (t ? t[0] : 0); // chance
            this.ab[AB_STOP] = [y, x];
            break;

          case 3:
            t = this.ab[AB_SLOW];
            x = inc2 + (t ? t[1] : 0); // duration
            y = inc1 + (t ? t[0] : 0); // chance
            this.ab[AB_SLOW] = [y, x];
            break;

          case 4:
            this.ab[AB_ONLY] = null;
            break;

          case 5:
            this.ab[AB_GOOD] = null;
            break;

          case 6:
            this.ab[AB_RESIST] = null;
            break;

          case 7:
            this.ab[AB_MASSIVE] = null;
            break;

          case 8:
            t = this.ab[AB_KB];
            x = inc1 + (t ? t[0] : 0); // chance
            this.ab[AB_KB] = [x];
            break;

          case 10:
            t = this.ab[AB_STRONG];
            x = t ? t[0] : (100 - inc1); // HP Trigger
            y = inc2 + (t ? t[1] : 0); // attack
            this.ab[AB_STRONG] = [x, y];
            break;

          case 11:
            t = this.ab[AB_LETHAL];
            x = inc1 + (t || 0); // chance
            this.ab[AB_LETHAL] = x;
            break;

          case 12:
            this.ab[AB_ATKBASE] = null;
            break;

          case 13:
            t = this.ab[AB_CRIT];
            x = inc1 + (t || 0); // chance
            this.ab[AB_CRIT] = x;
            break;

          case 14:
            this.ab[AB_ZKILL] = null;
            break;

          case 15:
            t = this.ab[AB_BREAK];
            x = inc1 + (t ? t[0] : 0); // chance
            this.ab[AB_BREAK] = [x];
            break;

          case 16:
            this.ab[AB_BOUNTY] = null;
            break;

          case 17:
            t = this.ab[AB_WAVE];
            x = inc1 + (t ? t[0] : 0);
            y = inc2 + (t ? t[1] : 0);
            this.ab[AB_WAVE] = [x, y];
            break;

          case 18:
            this.res[RES_WEAK] = inc1;
            break;

          case 19:
            this.res[RES_STOP] = inc1;
            break;

          case 20:
            this.res[RES_SLOW] = inc1;
            break;

          case 21:
            this.res[RES_KB] = inc1;
            break;

          case 22:
            this.res[RES_WAVE] = inc1;
            break;

          case 23:
            this.ab[AB_WAVES] = null;
            break;

          case 24:
            this.res[RES_WARP] = inc1;
            break;

          case 25:
            this.price -= inc1;
            break;

          case 26:
            this.cd -= inc1;
            break;

          case 27:
            this.speed += inc1;
            break;

          case 29:
            this.imu |= IMU_CURSE;
            break;

          case 30:
            this.res[RES_CURSE] = inc1;
            break;

          case 31:
            this.atkM = 1 + inc1 / 100;
            break;

          case 32:
            this.hpM = 1 + inc1 / 100;
            break;

          case 33:
            this.trait |= TB_RED;
            break;

          case 34:
            this.trait |= TB_FLOAT;
            break;

          case 35:
            this.trait |= TB_BLACK;
            break;

          case 36:
            this.trait |= TB_METAL;
            break;

          case 37:
            this.trait |= TB_ANGEL;
            break;

          case 38:
            this.trait |= TB_ALIEN;
            break;

          case 39:
            this.trait |= TB_ZOMBIE;
            break;

          case 40:
            this.trait |= TB_RELIC;
            break;

          case 41:
            this.trait |= TB_WHITE;
            break;

          case 42:
            this.trait |= TB_WITCH;
            break;

          case 43:
            this.trait |= TB_EVA;
            break;

          case 44:
            this.imu |= IMU_WEAK;
            break;

          case 45:
            this.imu |= IMU_STOP;
            break;

          case 46:
            this.imu |= IMU_SLOW;
            break;

          case 47:
            this.imu |= IMU_KB;
            break;

          case 48:
            this.imu |= IMU_WAVE;
            break;

          case 49:
            this.imu |= IMU_WARP;
            break;

          case 50:
            t = this.ab[AB_S];
            x = inc1 + (t ? t[0] : 0); // chance
            y = inc2 + (t ? t[1] : 0); // power
            this.ab[AB_S] = [x, y];
            break;

          case 51:
            t = this.ab[AB_IMUATK];
            x = inc1 + (t ? t[0] : 0); // chance
            y = inc2 + (t ? t[1] : 0); // duration
            this.ab[AB_IMUATK] = [x, y];
            break;

          case 52:
            this.res[RES_TOXIC] = inc1;
            break;

          case 53:
            this.imu |= IMU_POIATK;
            break;

          case 54:
            this.res[RES_SURGE] = inc1;
            break;

          case 55:
            this.imu |= IMU_VOLC;
            break;

          case 56:
            t = this.ab[AB_VOLC];
            x = inc1 + (t ? t[0] : 0); // chance
            y = inc2 + (t ? t[4] : 0); // level
            z = inc3 >> 2;
            this.ab[AB_VOLC] = [x, z, z + (inc4 >> 2), y * 20, y];
            break;

          case 57:
            this.trait |= TB_DEMON;
            break;

          case 58:
            t = this.ab[AB_SHIELDBREAK];
            x = inc1 + (t ? t[0] : 0); // chance
            this.ab[AB_SHIELDBREAK] = [x];
            break;

          case 59:
            this.ab[AB_CKILL] = null;
            break;

          case 60:
            t = this.ab[AB_CURSE];
            x = inc2 + (t ? t[1] : 0); // chance
            y = inc1 + (t ? t[0] : 0); // duration
            this.ab[AB_CURSE] = [y, x];
            break;

          case 61:
            this.tba = ~~(this.tba * (100 - inc1) / 100);
            this.attackF = (this.pre2 || this.pre1 || this.pre) + Math.max(this.backswing, this.tba - 1);
            break;

          case 62: // Mini Wave
            t = this.ab[AB_MINIWAVE];
            x = inc1 + (t ? t[0] : 0);
            y = inc2 + (t ? t[1] : 0);
            this.ab[AB_MINIWAVE] = [x, y];
            break;

          case 63:
            this.ab[AB_BAIL] = null;
            break;

          case 64:
            this.ab[AB_BSTHUNT] = [ inc1, inc2 ];
            break;

          case 65:
            t = this.ab[AB_MINIVOLC];
            x = inc1 + (t ? t[0] : 0); // chance
            y = inc2 + (t ? t[4] : 0); // level
            z = inc3 >> 2;
            this.ab[AB_MINIVOLC] = [x, z, z + (inc4 >> 2), y * 20, y];
            break;
          case 66:
            this.ab[AB_SAGE] = null;
            break;
        }
    }
    applySuperTalents(talents, levels) {
        let j = 0;
        for (let i = 0; i < 112 && talents[i]; i += 14) {
          1 == talents[i + 13] && this.applyTalent(talents.subarray(i, i + 14), levels[j++]);
        }
    }
    applyTalents(info, levels) {
        info.hasOwnProperty("talentT") && (this.trait |= info.talentT);
        let _super = !(this.res = {}), j = 0;
        for (let i = 0; i < 112 && info.talents[i]; i += 14) 1 == info.talents[i + 13] ? _super = !0 : this.applyTalent(info.talents.subarray(i, i + 14), levels[j++]);
        return _super;
    }
    hasres(r) {
        return this.res && this.res.hasOwnProperty(r);
    }
    hasab(ab) {
        return this.ab.hasOwnProperty(ab);
    }
    getid() {
        return this.id;
    }
    gettba() {
        return this.tba;
    }
    getpre() {
        return this.pre;
    }
    getpre1() {
        return this.pre1;
    }
    getpre2() {
        return this.pre2;
    }
    getTotalLv() {
        return Math.min(def_lv, _info.maxBase) + Math.min(plus_lv, _info.maxPlus);
    }
    getmax_base_lv() {
      return _info.maxBase;
    }
    getmax_plus_lv() {
      return _info.maxPlus;
    }
    getslow_time() {
      const t = this.ab[AB_SLOW];
      return t ? t[1] : 0;
    }
    getslow_prob() {
      const t = this.ab[AB_SLOW];
      return t ? t[0] : 0;
    }
    getstop_time() {
      const t = this.ab[AB_STOP];
      return t ? t[1] : 0;
    }
    getstop_prob() {
      const t = this.ab[AB_STOP];
      return t ? t[0] : 0;
    }
    getcurse_time() {
      const t = this.ab[AB_CURSE];
      return t ? t[1] : 0;
    }
    getcurse_prob() {
      const t = this.ab[AB_CURSE];
      return t ? t[0] : 0;
    }
    getweak_time() {
      const t = this.ab[AB_WEAK];
      return t ? t[2] : 0;
    }
    getweak_prob() {
      const t = this.ab[AB_WEAK];
      return t ? t[0] : 0;
    }
    getweak_extent() {
      const t = this.ab[AB_WEAK];
      return t ? t[1] : 0;
    }
    getstrong_extent() {
      const t = this.ab[AB_STRONG];
      return t ? t[1] : 0;
    }
    getlethal_prob() {
      return this.ab[AB_LETHAL] || 0;
    }
    getsavage_extent() {
      const t = this.ab[AB_S];
      return t ? t[1] : 0;
    }
    getsavage_prob() {
      const t = this.ab[AB_S];
      return t ? t[0] : 0;
    }
    getbreak_prob() {
      const t = this.ab[AB_BREAK];
      return t ? t[0] : 0;
    }
    getshield_break_prob() {
      const t = this.ab[AB_SHIELDBREAK];
      return t ? t[0] : 0;
    }
    getmini_wave_prob() {
      const t = this.ab[AB_MINIWAVE];
      return t ? t[0] : 0;
    }
    getwave_prob() {
      const t = this.ab[AB_WAVE];
      return t ? t[0] : 0;
    }
    getmini_surge_prob() {
      const t = this.ab[AB_MINIVOLC];
      return t ? t[0] : 0;
    }
    getsurge_prob() {
      const t = this.ab[AB_VOLC];
      return t ? t[0] : 0;
    }
    getdodge_time() {
      const t = this.ab[AB_IMUATK];
      return t ? t[1] : 0;
    }
    getdodge_prob() {
      const t = this.ab[AB_IMUATK];
      return t ? t[0] : 0;
    }
    getformc() {
        return this.lvc + 1;
    }
    getkb() {
        return this.kb;
    }
    getrarity() {
        return _info.rarity;
    }
    gettrait() {
        return this.trait;
    }
    getrange() {
        return this.range;
    }
    getattackf() {
        return this.attackF;
    }
    getattacks() {
        return this.attackF / 30;
    }
    getrevenge() {
        return 0 != (this.atkType & ATK_KB_REVENGE);
    }
    getbackswing() {
        return this.backswing;
    }
    getbeast_prob() {
      const t = this.ab[AB_BSTHUNT];
      return t ? t[0] : 0;
    }
    getbeast_time() {
      const t = this.ab[AB_BSTHUNT];
      return t ? t[1] : 0;
    }
    getstop_cover() {
      const t = this.ab[AB_STOP];
      if (!t) return 0;
      return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[1] * 1.2) : t[1]);
    }
    getslow_cover() {
      const t = this.ab[AB_SLOW];
      if (!t) return 0;
      return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[1] * 1.2) : t[1]);
    }
    getweak_cover() {
      const t = this.ab[AB_WEAK];
      if (!t) return 0;
      return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[2] * 1.2) : t[2]);
    }
    getcurse_cover() {
      const t = this.ab[AB_CURSE];
      if (!t) return 0;
      return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[1] * 1.2) : t[1]);
    }
    gethp() {
        return ~~(~~(2.5 * Math.round(this.hp * getLevelMulti(this.getTotalLv()))) * this.hpM);
    }
    getatk() {
      const m = getLevelMulti(this.getTotalLv());
      let atk = ~~(~~(2.5 * Math.round(this.atk * m)) * this.atkM);
      if (this.atk1) {
        atk += ~~(~~(2.5 * Math.round(this.atk1 * m)) * this.atkM);
        if (this.atk2) {
          atk += ~~(~~(2.5 * Math.round(this.atk2 * m)) * this.atkM);
        }
      }
      return atk;
    }
    getattack() {
      return this.getatk();
    }
    getdps() {
        return ~~(30 * this.getatk() / this.attackF);
    }
    getthp() {
        let hp = this.gethp();
        if (this.ab.hasOwnProperty(AB_WKILL))
          return hp * 10;
        if (this.ab.hasOwnProperty(AB_EKILL))
          return hp * 5;
        if (this.ab.hasOwnProperty(AB_RESIST)) {
          hp *= this.trait & trait_treasure ? 5 : 4;
        } else if (this.ab.hasOwnProperty(AB_RESISTS)) {
          hp *= this.trait & trait_treasure ? 7: 6;
        }
        if (this.ab.hasOwnProperty(AB_GOOD)) {
          hp *= this.trait & trait_treasure ? 2 : 2.5;
        }
        if (this.ab.hasOwnProperty(AB_BSTHUNT)) {
          hp /= 0.6;
        } else if (this.ab.hasOwnProperty(AB_BAIL)) {
          hp /= 0.7;
        } else if (this.ab.hasOwnProperty(AB_SAGE)) {
          hp += hp;
        }
        return hp;
    }
    getwavelv() {
      const t = this.ab[AB_WAVE];
      return t ? t[1] : 0;
    }
    getvolclv() {
      const t = this.ab[AB_VOLC];
      return t ? t[4] : 0;
    }
    getminiwavelv() {
      const t = this.ab[AB_MINIWAVE];
      return t ? t[1] : 0;
    }
    getminivolclv() {
      const t = this.ab[AB_MINIVOLC];
      return t ? t[4] : 0;
    }
    getcrit() {
        return this.ab[AB_CRIT] | 0;
    }
    hpagainst(traits) {
        let hp = this.gethp();
        if ((traits & TB_WITCH) && this.ab.hasOwnProperty(AB_WKILL))
          return hp * 10;
        if ((traits & TB_EVA) && this.ab.hasOwnProperty(AB_EKILL))
          return hp * 5;
        const t = this.trait & traits;
        if (t) {
          if (this.ab.hasOwnProperty(AB_RESIST)) {
            hp *= t & trait_treasure ? 5 : 4;
          } else if (this.ab.hasOwnProperty(AB_RESISTS)) {
            hp *= t & trait_treasure ? 7: 6;
          }
          if (this.ab.hasOwnProperty(AB_GOOD)) {
            hp *= t & trait_treasure ? 2 : 2.5;
          }
        }
        if (traits & TB_BEAST) {
          hp /= 0.6; 
        }
        if (traits & TB_BARON) {
          hp /= 0.7;
        }
        return hp;

    }
    dpsagainst(traits) {
      if (this.ab.hasOwnProperty(AB_ONLY) && (!(traits & this.trait)))
        return 0;
      let t = 0;
      for (let x of this._dpsagainst(traits)) {
        t += ~~x;
      }
      return ~~((30 * t) / this.attackF);
    }
    _dpsagainst(traits) {
        let atks = this._getatks();
        let v;
        if (this.ab.hasOwnProperty(AB_ATKBASE)) {
          this.mul(atks, 1 + this.ab[AB_ATKBASE][0] / 100);
          return atks;
        }
        if (this.ab.hasOwnProperty(AB_VOLC)) {
            v = this.ab[AB_VOLC];
            this.mul(atks, 1 + v[4] * v[0] / 100, false);
        }
        else if (this.ab.hasOwnProperty(AB_MINIVOLC)) {
            v = this.ab[AB_MINIVOLC];
            this.mul(atks,  1 + v[4] * v[0] / 500, false);
        }
        if (this.ab.hasOwnProperty(AB_WAVE)) {
          this.mul(atks, 1 + this.ab[AB_WAVE][0] / 100, false);
        } else if (this.ab.hasOwnProperty(AB_MINIWAVE)) {
          this.mul(atks, 1 + this.ab[AB_MINIWAVE][0] / 500, false);
        }
        if (this.ab.hasOwnProperty(AB_S)) {
          v = this.ab[AB_S];
          this.mul(atks, 1 + v[0] * v[1] / 10000, false);
        }
        if (this.ab.hasOwnProperty(AB_CRIT)) {
          if (traits & TB_METAL) {
            this.mul(atks, this.ab[AB_CRIT] / 100, false);
          } else {
            this.mul(atks, 1 + this.ab[AB_CRIT] / 100, false);
          }
        }
        if (this.ab.hasOwnProperty(AB_STRONG)) {
          this.mul(atks, 1 + this.ab[AB_STRONG][1] / 100);
        }
        if ((traits & TB_EVA) && this.ab.hasOwnProperty(AB_EKILL)) {
          this.mul(atks, 5);
          return atks;
        } else if ((traits & TB_WITCH) && this.ab.hasOwnProperty(AB_WKILL)) {
          this.mul(atks, 5);
          return atks;
        }
        const t = this.trait & traits;
        if (t) {
          const x = t & trait_treasure;
          if (this.ab.hasOwnProperty(AB_MASSIVE)) {
            this.mul(atks, x ? 4 : 3);
          } else if (this.ab.hasOwnProperty(AB_MASSIVES)) {
            this.mul(atks, x ? 6 : 5);
          }
          if (this.ab.hasOwnProperty(AB_GOOD)) {
            this.mul(atks, x ? 1.8 : 1.5);
          }
        }
        if ((traits & TB_BEAST) && this.ab.hasOwnProperty(AB_BSTHUNT)) {
          this.mul(atks, 2.5);
        }
        else if ((traits & TB_BARON) && this.ab.hasOwnProperty(AB_BAIL)) {
          this.mul(atks, 1.6);
        }
        else if ((traits & TB_SAGE) && this.ab.hasOwnProperty(AB_SAGE)) {
          this.mul(atks, 1.2);
        }
        if (traits & TB_METAL) {
          let r = this.ab[AB_CRIT];
          if (r == undefined) {
            atks = [1];
            return atks;
          }
          atks[0] += 1 - r / 100;
          return atks;
        }
        return atks;
    }
    _gettatk() {
        let atks = this._getatks();
        if (this.ab.hasOwnProperty(AB_ATKBASE)) {
          this.mul(atks, 1 + this.ab[AB_ATKBASE][0] / 100);
          return atks;
        }
        if (this.ab.hasOwnProperty(AB_VOLC)) {
            this.mul(atks, 1 + this.ab[AB_VOLC][4], false);
        }
        else if (this.ab.hasOwnProperty(AB_MINIVOLC)) {
            this.mul(atks, 1 + this.ab[AB_MINIVOLC][4] * 0.2, false);
        }
        if (this.ab.hasOwnProperty(AB_WAVE)) {
          this.mul(atks, 2, false);
        } else if (this.ab.hasOwnProperty(AB_MINIWAVE)) {
          this.mul(atks, 1.2, false);
        }
        if (this.ab.hasOwnProperty(AB_S)) {
          this.mul(atks, 1 + this.ab[AB_S][1] / 100, false);
        }
        if (this.ab.hasOwnProperty(AB_CRIT)) {
          this.mul(atks, 2, false);
        }
        if (this.ab.hasOwnProperty(AB_STRONG)) {
          this.mul(atks, 1 + this.ab[AB_STRONG][1] / 100);
        }
        if (this.ab.hasOwnProperty(AB_EKILL) || this.ab.hasOwnProperty(AB_WKILL)) {
          this.mul(atks, 5);
          return atks;
        }
        if (this.ab.hasOwnProperty(AB_MASSIVE)) {
          this.mul(atks, this.trait & trait_treasure ? 4 : 3);
        } else if (this.ab.hasOwnProperty(AB_MASSIVES)) {
          this.mul(atks, this.trait & trait_treasure ? 6 : 5);
        }
        if (this.ab.hasOwnProperty(AB_GOOD)) {
          this.mul(atks, this.trait & trait_treasure ? 1.8 : 1.5);
        }
        if (this.ab.hasOwnProperty(AB_BSTHUNT)) {
          this.mul(atks, 2.5);
        } else if (this.ab.hasOwnProperty(AB_BAIL)) {
          this.mul(atks, 1.6);
        } else if (this.ab.hasOwnProperty(AB_SAGE)) {
          this.mul(atks, 1.2);
        }
        return atks;
    }
    getrange_min() {
      if ((this.atkType & ATK_OMNI) || (this.atkType & ATK_LD)) {
        return Math.max.apply(null, this.lds);;
      }
      return this.range;
    }
    getrange_max() {
      if ((this.atkType & ATK_OMNI) || (this.atkType & ATK_LD)) {
        m = this.lds[0] + this.ldr[1];
        for (let i = 1;i < this.lds.length;++i)
          m = Math.max(m, this.lds[i] + this.ldr[i]);
        return m;
      }
      return this.range;
    }
    getreach_base() {
      if (!this.lds.length) return this.range;
      return this.lds[0] > 0 ? this.lds[0] : this.range;
    }
    getrange_interval() {
      return this.lds.length ? Math.abs(this.ldr[0]) : 0;
    }
    getrange_interval_max() {
      if ((this.atkType & ATK_OMNI) || (this.atkType & ATK_LD)) {
        let x, r = this.lds[0], R = r + this.ldr[0];
        for (let i = 1;i < this.lds.length;++i) {
          x = this.lds[i];
          r = Math.max(r, x);
          R = Math.max(R, x + this.ldr[i]);
        }
        return Math.abs(R - r);
      }
      return 0;
    }
    involve4_require(x) {
      if (!_info.f4Reqs) return 0;
      for (const r of _info.f4Reqs) {
        if (r[1] == x)
          return r[0];
      }
      return 0;
    }
    involve_require(x) {
      if (!_info.upReqs) return 0;
      for (const r of _info.upReqs) {
        if (r[1] == x)
          return r[0];
      }
      return 0;
    }
    getatkcount() {
      let c = 1;
      if (this.pre1) {
        c += 1;
        if (this.pre2)
          c += 1;
      }
      return c;
    }
    gettdps() {
      let t = 0;
      for (let x of this._gettdps())
        t += ~~x;
      return ~~((30 * t) / this.attackF);
    }
    _gettdps() {
        let atks = this._getatks();
        let v;
        if (this.ab.hasOwnProperty(AB_ATKBASE)) {
          this.mul(atks, 1 + this.ab[AB_ATKBASE][0] / 100);
          return atks;
        }
        if (this.ab.hasOwnProperty(AB_VOLC)) {
            v = this.ab[AB_VOLC];
            this.mul(atks, 1 + v[4] * v[0] / 100, false);
        } else if (this.ab.hasOwnProperty(AB_MINIVOLC)) {
            v = this.ab[AB_MINIVOLC];
            this.mul(atks,  1 + v[4] * v[0] / 500, false);
        }
        if (this.ab.hasOwnProperty(AB_WAVE)) {
          this.mul(atks, 1 + this.ab[AB_WAVE][0] / 100, false);
        } else if (this.ab.hasOwnProperty(AB_MINIWAVE)) {
          this.mul(atks, 1 + this.ab[AB_MINIWAVE][0] / 500, false);
        }
        if (this.ab.hasOwnProperty(AB_S)) {
          v = this.ab[AB_S];
          this.mul(atks, 1 + v[0] * v[1] / 10000, false);
        }
        if (this.ab.hasOwnProperty(AB_CRIT)) {
          this.mul(atks, 1 + this.ab[AB_CRIT] / 100, false);
        }
        if (this.ab.hasOwnProperty(AB_STRONG)) {
          this.mul(atks, 1 + this.ab[AB_STRONG][1] / 100);
        }
        if (this.ab.hasOwnProperty(AB_EKILL) || this.ab.hasOwnProperty(AB_WKILL)) {
          this.mul(atks, 5);
          return atks;
        }
        if (this.ab.hasOwnProperty(AB_MASSIVE)) {
          this.mul(atks, this.trait & trait_treasure ? 4 : 3);
        } else if (this.ab.hasOwnProperty(AB_MASSIVES)) {
          this.mul(atks, this.trait & trait_treasure ? 6 : 5);
        }
        if (this.ab.hasOwnProperty(AB_GOOD)) {
          this.mul(atks, this.trait & trait_treasure ? 1.8 : 1.5);
        }
        if (this.ab.hasOwnProperty(AB_BSTHUNT)) {
          this.mul(atks, 2.5);
        } else if (this.ab.hasOwnProperty(AB_BAIL)) {
          this.mul(atks, 1.6);
        } else if (this.ab.hasOwnProperty(AB_SAGE)) {
          this.mul(atks, 1.2);
        }
        return atks;
    }
    _getatks() {
      const m = getLevelMulti(this.getTotalLv());
      let atks = [this.atk];
      if (this.atk1)
        atks.push(this.atk1);
      if (this.atk2)
        atks.push(this.atk2);
      for (let i = 0;i < atks.length;++i)
        atks[i] = ~~(
        (
          ~~(Math.round(atks[i] * m) * atk_t)
        ) * this.atkM);
      return atks;
    }
    gettatk() {
      let x = this._gettatk();
      let s = 0;
      for (const i of x)
        s += i;
      return s;
    }
    mul(arr, s, ab=true) {
      for (let i = 0; i < arr.length; ++i)
          (ab || this.abi & 1 << 2 - i) && (arr[i] *= s)
    }
    _gettatk() {
        let atks = this._getatks();
        if (this.ab.hasOwnProperty(AB_ATKBASE)) {
          this.mul(atks, 1 + this.ab[AB_ATKBASE][0] / 100);
          return atks;
        }
        if (this.ab.hasOwnProperty(AB_VOLC)) {
            this.mul(atks, 1 + this.ab[AB_VOLC][4], false);
        }
        else if (this.ab.hasOwnProperty(AB_MINIVOLC)) {
            this.mul(atks, 1 + this.ab[AB_MINIVOLC][4] * 0.2, false);
        }
        if (this.ab.hasOwnProperty(AB_WAVE)) {
          this.mul(atks, 2, false);
        } else if (this.ab.hasOwnProperty(AB_MINIWAVE)) {
          this.mul(atks, 1.2, false);
        }
        if (this.ab.hasOwnProperty(AB_S)) {
          this.mul(atks, 1 + this.ab[AB_S][1] / 100, false);
        }
        if (this.ab.hasOwnProperty(AB_CRIT)) {
          this.mul(atks, 2, false);
        }
        if (this.ab.hasOwnProperty(AB_STRONG)) {
          this.mul(atks, 1 + this.ab[AB_STRONG][1] / 100);
        }
        if (this.ab.hasOwnProperty(AB_EKILL) || this.ab.hasOwnProperty(AB_WKILL)) {
          this.mul(atks, 5);
          return atks;
        }
        if (this.ab.hasOwnProperty(AB_MASSIVE)) {
          this.mul(atks, this.trait & trait_treasure ? 4 : 3);
        } else if (this.ab.hasOwnProperty(AB_MASSIVES)) {
          this.mul(atks, this.trait & trait_treasure ? 6 : 5);
        }
        if (this.ab.hasOwnProperty(AB_GOOD)) {
          this.mul(atks, this.trait & trait_treasure ? 1.8 : 1.5);
        }
        if (this.ab.hasOwnProperty(AB_BSTHUNT)) {
          this.mul(atks, 2.5);
        } else if (this.ab.hasOwnProperty(AB_BAIL)) {
          this.mul(atks, 1.6);
        } else if (this.ab.hasOwnProperty(AB_SAGE)) {
          this.mul(atks, 1.2);
        }
        return atks;
    }
    getspeed() {
        return this.speed;
    }
    getprice() {
        return 1.5 * this.price;
    }
    getcost() {
        return 1.5 * this.price;
    }
    getcdf() {
      return getRes(this.cd);
    }
    getcd() {
        return getRes(this.cd) / 30;
    }
    getimu() {
        return this.imu;
    }
    getatktype() {
        return this.atkType;
    }
}

class CatInfo {
    constructor(id, t4) {
        id instanceof Object ? Object.assign(this, id) : (this.loadTalents(id), 
        this.loadAttitional(id));
        if (t4)
          this.t4 = t4;
    }
    getRarityString(cat_id) {
        return [ "基本", "EX", "稀有", "激稀有", "超激稀有", "傳說稀有" ][this.rarity];
    }
    loadAttitional(my_id) {
        this.fandom = fandom[my_id];
        for (var end, obt_id = obtainid[my_id], text = (null != obt_id && (this.obtain = obt_id), 
        unit_buy), i = 0, start = 0; i < my_id; ) {
            for (var j = start; "\n" != text[j]; ++j);
            start = j + 1, ++i;
        }
        for (end = start; "\n" != text[end]; ++end);
        var data = text.slice(start, end).split(",").map(x => parseInt(x)), obt_id = (data[0] && (this.unclockS = data[0]), 
        data[1] && (this.unclockFood = data[1]), rwMap.hasOwnProperty(my_id.toString()) && (this.rw = rwMap[my_id]), 
        tfMap.hasOwnProperty(my_id.toString()) && (this.tf = tfMap[my_id]), this.rarity = data[13], 
        this.maxBase = data[50], this.maxPlus = data[51], data[data.length - 6]);
        1e5 <= obt_id && (this.version = obt_id);
        data[23] && (this.tfmethod = data[23]);
        if (data[27]) {
            this.upReqs = [ [ data[27], 0 ] ];
            for (let i = 28; i < 38; i += 2) {
                var amount = data[i + 1];
                amount && this.upReqs.push([ amount, data[i] ]);
            }
        }
        if (data[38]) {
          this.f4Reqs = [[data[38], 0]];
          for (let i = 39;i < 49;i += 2) {
            var amount = data[i + 1];
            amount && this.f4Reqs.push([ amount, data[i] ]);
          }
        }
        this.crazed = 5e4 < data[3] && 3 == data[13], this.xp_data = data.slice(2, 12).join(","), 
        _eggs = data.slice(data.length - 2);
        obt_id = unit_orbs[my_id];
        obt_id && (this.orbC = obt_id);
    }
    loadTalents(my_id) {
        my_id = skill_file.indexOf(`
${my_id},`);
        if (-1 != my_id) {
            ++my_id;
            let end;
            for (end = my_id; "\n" != skill_file[end] && skill_file[end]; ++end);
            var data = skill_file.slice(my_id, end).split(",");
            this.talents = new Int16Array(112), "0" != data[1] && (this.talentT = parseInt(data[1]));
            for (let i = 0; i < 112; ++i) this.talents[i] = data[2 + i];
        }
    }
}

class Enemy {
    constructor(id, name, jp_name, data, trait) {
        if (id instanceof Object) Object.assign(this, id); else {
            this.id = id;
            id -= 2;
            this.ts = trait;
            this.name = name;
            this.jp_name = jp_name;
            this.fandom = fandom[id];
            this.desc = enemy_descs[id];
            this.backswing = anim1[id];
            this.hp = data[0];
            this.kb = data[1];
            this.speed = data[2]; 
            this.atk = data[3];
            this.tba = 2 * data[4];
            this.atkType = data[11] ? ATK_RANGE : ATK_SINGLE;
            this.earn = data[6];
            this.range = data[5];
            this.trait = 0;
            this.isrange = 0 != data[11];
            this.pre = data[12];
            this.death = data[54];
            this.atk1 = data[55];
            this.atk2 = data[56]; 
            this.pre1 = data[57];
            this.pre2 = data[58];
            this.abi = ((data[59] == undefined ? 1 : data[59]) << 2) + (data[60] << 1) + data[61], 
            this.star = data[69];
            this.ab = {};
            this.imu = 0;
            this.attackF = (this.pre2 || this.pre1 || this.pre) + Math.max(this.backswing, this.tba - 1);
            data[10] && (this.trait |= TB_RED);
            data[13] && (this.trait |= TB_FLOAT);
            data[14] && (this.trait |= TB_BLACK);
            data[15] && (this.trait |= TB_METAL);
            data[16] && (this.trait |= TB_WHITE); 
            data[17] && (this.trait |= TB_ANGEL);
            data[18] && (this.trait |= TB_ALIEN); 
            data[19] && (this.trait |= TB_ZOMBIE);
            data[48] && (this.trait |= TB_WITCH); 
            data[49] && (this.trait |= TB_INFN);
            data[71] && (this.trait |= TB_EVA);
            data[72] && (this.trait |= TB_RELIC);
            data[93] && (this.trait |= TB_DEMON);
            data[94] && (this.trait |= TB_BARON);
            data[101] && (this.trait |= TB_BEAST);
            data[104] && (this.trait |= TB_SAGE);
            data[20] && (this.ab[AB_KB] = [ data[20] ]), data[29] && (this.ab[AB_WEAK] = [ data[29], data[30], data[31] ]);
            data[21] && (this.ab[AB_STOP] = [ data[21], data[22] ]), data[23] && (this.ab[AB_SLOW] = [ data[23], data[24] ]); 
            data[73] && (this.ab[AB_CURSE] = [ data[73], data[74] ]), data[25] && (this.ab[AB_CRIT] = data[25]);
            data[26] && (this.ab[AB_ATKBASE] = null), data[32] && (this.ab[AB_STRONG] = [ data[32], data[33] ]);
            data[34] && (this.ab[AB_LETHAL] = data[34]);
            data[38] && (this.ab[AB_WAVES] = null);
            data[43] && (this.ab[AB_BURROW] = [ data[43], data[44] >> 2 ]);
            data[45] && (this.ab[AB_REVIVE] = [ data[45], data[46], data[47] ]);
            2 == data[52] && (this.ab[AB_GLASS] = null);
            data[64] && (this.ab[AB_SHIELD] = [ data[64] ]);
            data[65] && (this.ab[AB_WARP] = [ data[65], data[66], data[67] >> 2 ]);
            data[75] && (this.ab[AB_S] = [ data[75], data[76] ]);
            data[77] && (this.ab[AB_IMUATK] = [ data[77], data[78] ]);
            data[79] && (this.ab[AB_POIATK] = [ data[79], data[80] ]);
            data[87] && (this.ab[AB_DSHIELD] = [ data[87], data[88] ]);
            data[89] && (this.ab[AB_AFTERMATH] = [ data[89], data[90] >> 2, data[91] + data[90] >> 2, data[92] ]);
            data[103] && (this.ab[AB_COUNTER] = null);
            data[27] && (data[86] ? this.ab[AB_MINIWAVE] = [ data[27], data[28] ] : this.ab[AB_WAVE] = [ data[27], data[28] ]);
            data[81] && (data[102] ? this.ab[AB_MINIVOLC] = [ data[81], data[82] >> 2, data[83] + data[82] >> 2, data[84] ] : this.ab[AB_VOLC] = [ data[81], data[82] >> 2, data[83] + data[82] >> 2, data[84] ]);
            data[37] && (this.imu |= IMU_WAVE), data[39] && (this.imu |= IMU_KB);
            data[40] && (this.imu |= IMU_STOP), data[41] && (this.imu |= IMU_SLOW);
            data[42] && (this.imu |= IMU_WEAK), data[85] && (this.imu |= IMU_VOLC);
            data[70] && (this.imu |= IMU_WARP);
		data[105] && (this.imu |= IMU_CURSE);
            var x, atkCount = 0 == this.atk1 ? 1 : 0 == this.atk2 ? 2 : 3;
            this.lds = new Array(atkCount), this.lds[0] = data[35], this.ldr = new Array(atkCount), 
            this.ldr[0] = data[36];
            for (let i = 1; i < atkCount; ++i) 1 == data[95 + 3 * (i - 1)] ? (this.lds[i] = data[95 + 3 * (i - 1) + 1], 
            this.ldr[i] = data[95 + 3 * (i - 1) + 2]) : (this.lds[i] = this.lds[0], 
            this.ldr[i] = this.ldr[0]);
            for (x of this.ldr) {
                if (x < 0) {
                    this.atkType |= ATK_OMNI;
                    break;
                }
                if (0 < x) {
                    this.atkType |= ATK_LD;
                    break;
                }
            }
            this.tba + this.pre < this.attackF / 2 && (this.atkType |= ATK_KB_REVENGE);
        }
    }
    gethp() {
        return this.hp;
    }
    getthp() {
        return this.hp;
    }
    getatk() {
        return this.atk + this.atk1 + this.atk2;
    }
    getattack() {
      return this.getatk();
    }
    gettatk() {
        return this.getatk();
    }
    getdps() {
        return 30 * this.getatk() / this.attackF;
    }
    gettdps() {
        return this.getdps();
    }
    getimu() {
        return this.imu;
    }
    hasab(i) {
        return this.ab.hasOwnProperty(i);
    }
    getid() {
        return this.id - 2;
    }
    hasres() {
        return 0;
    }
    gettba() {
        return this.tba;
    }
    getpre() {
        return this.pre;
    }
    getpre1() {
        return this.pre1;
    }
    getpre2() {
        return this.pre2;
    }
    getTotalLv() {
        return 0;
    }
    getkb() {
        return this.kb;
    }
    gettrait() {
        return this.trait;
    }
    getrange() {
        return this.range;
    }
    getattackf() {
        return this.attackF;
    }
    getattacks() {
        return this.attackF / 30;
    }
    getrevenge() {
        return 0 != (this.atkType & ATK_KB_REVENGE);
    }
    getbackswing() {
        return this.backswing;
    }
    getcost() {
        return Math.round(100 * (this.earn * (.95 + .05 * treasures[18] + .005 * treasures[3]) + Number.EPSILON)) / 100;
    }
    getprice() {
        return this.getCost();
    }
    getspeed() {
        return this.speed;
    }
    getatktype() {
        return this.atkType;
    }
}

class Cat {
    constructor(id, unit_file, curve, name, jp_name, desc, ic, t4) {
        if (id instanceof Object) {
            this.forms = new Array(id.forms.length);
            for (let i = 0; i < id.forms.length; ++i) this.forms[i] = new Form(id.forms[i]);
            this.info = new CatInfo(id.info);
            this.curve = id.curve;
            this.ic = id.ic;
        } else {
            this.curve = curve;
            this.info = new CatInfo(id, t4);
            this.forms = new Array(unit_file.length);
            this.ic = ic;
            for (let i = 0; i < unit_file.length; ++i)
                this.forms[i] = new Form(name[i] || '', jp_name[i] || '', desc[i], id, i, unit_file[i].split(',').map(x => parseInt(x)));
        }
    }
    init() {
        for (var f of this.forms) f.hpM = 1, f.atkM = 1;
    }
    getObj() {
        return {
            'info': this.info,
            'forms': this.forms,
            'curve': this.curve,
            'ic': this.ic
        };
    }
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw 'load failed';
  return res.json();
}

async function getText(url) {
  const res = await fetch(url);
  if (!res.ok) throw 'load failed';
  return res.text();
}

async function getAllEnemies() {
    const enemy_data = await getJSON('/data/enemies.json');
    fandom = await getJSON("/data/fandomEnemyNames.json");
    const t_unit = (await getText("/data/all_enemy")).replace("\r", "").split("\n").filter(x => x.trim()).map(line => line.split(",").map(x => parseInt(x)));
    enemy_descs = enemy_data['tw-desc'];
    anim1 = enemy_data['backswing'];
    const en_tw = enemy_data['tw-name'];
    const en_jp = enemy_data['jp-name'];
    const traits = enemy_data['trait'];
    var enemies = new Array(t_unit.length);
    for (let id = 2; id < enemies.length; ++id) {
        var unit_file = t_unit[id], y = id - 2;
        enemies[id] = new Enemy(id, en_tw[y], en_jp[y], unit_file, traits[y]);
    }
    return anim1 = fandom = enemy_descs = enim1 = null, enemies;
}

async function getAllCats() {
    const loader_text = document.getElementById("loader-text");
    loader_text.textContent = '載入中(1/5)';
    var all_cats = (await getText("/data/all_cats")).split('\n');
    loader_text.textContent = '載入中(2/5)';
    var cat_data = await getJSON("/data/cat.json");
    loader_text.textContent = '載入中(3/5)';
    fandom = await getJSON("/data/fandomCatNames.json");
    loader_text.textContent = '載入中(4/5)';
    unit_buy = await getText("/data/u");
    loader_text.textContent = '載入中(5/5)';
    skill_file = await getText("/data/talent");
    loader_text.textContent = '即將完成';
    rwMap = cat_data['rwMap'];
    tfMap = cat_data['tfMap'];
    var t4 = cat_data['t4'];
    var levels = cat_data['curve'];
    var tw_n = cat_data['tw-name'];
    var jp_n = cat_data['jp-name'];
    var dec = cat_data['tw-desc'];
    var ic = cat_data['ic'];
    enemy_descs = cat_data['involve'];
    anim1 = cat_data['backswing'];
    unit_orbs = cat_data['orb'];
    obtainid = cat_data['obtain'];
    var cats = new Array(anim1.length);
    for (let id = 0; id < cats.length; ++id)
        cats[id] = new Cat(id, all_cats[id].split('\t'), levels[id], tw_n[id], jp_n[id], dec[id], ic[id], t4[id]);
    enemy_descs = anim1 = fandom = obtainid = skill_file = rwMap = tfMap = unit_buy = null;
    return cats;
}

function onupgradeneeded(event) {
    event = event.target.result;
    try {
        event.deleteObjectStore("cats");
    } catch (e) {}
    try {
        event.deleteObjectStore("enemy");
    } catch (e) {}
    let store = event.createObjectStore("cats", {
        keyPath: "id"
    });
    store.createIndex("data", "", {
        unique: !1
    }), (store = event.createObjectStore("enemy", {
        keyPath: "id"
    })).createIndex("data", "", {
        unique: !1
    });
}
async function loadCat(id) {
    return new Promise(resolve => {
        var req = indexedDB.open("db", C_VER);
        req.onupgradeneeded = onupgradeneeded, req.onsuccess = function(event) {
            const db = event.target.result;
            db.transaction([ "cats" ], "readwrite").objectStore("cats").get(id).onsuccess = function(event) {
                var event = event.target.result;
                if (event) return (event = new Cat(event.data)).init(), resolve(event);
                getAllCats().then(cats => {
                    var tx = db.transaction([ "cats" ], "readwrite"), store = tx.objectStore("cats");
                    for (let i = 0; i < cats.length; ++i) store.put({
                        id: i,
                        data: cats[i].getObj()
                    });
                    tx.oncomplete = function() {
                        var c = cats[id];
                        c.init(), db.close(), resolve(c);
                    };
                });
            };
        };
    });
}

async function loadEnemy(id) {
    return new Promise((resolve, reject) => {
        var req = indexedDB.open("db", C_VER);
        req.onupgradeneeded = onupgradeneeded, req.onsuccess = function(event) {
            const db = event.target.result;
            db.transaction([ "enemy" ], "readwrite").objectStore("enemy").get(id).onsuccess = function(event) {
                event = event.target.result;
                if (event) return event.data ? resolve(new Enemy(event.data)) : reject();
                getAllEnemies().then(es => {
                    var tx = db.transaction([ "enemy" ], "readwrite"), store = tx.objectStore("enemy");
                    for (let i = 0; i < es.length; ++i) store.put({
                        id: i,
                        data: es[i]
                    });
                    tx.oncomplete = function() {
                        db.close();
                        resolve(es[id]);
                    };
                });
            };
        };
    });
}

async function loadAllEnemies() {
    return new Promise(resolve => {
        var req = indexedDB.open("db", C_VER);
        req.onupgradeneeded = onupgradeneeded, req.onsuccess = function(event) {
            const db = event.target.result;
            db.transaction([ "enemy" ], "readwrite").objectStore("enemy").get(651).onsuccess = function(event) {
                if (event.target.result) {
                    let es = new Array({{{num-enemies}}});
                    db.transaction([ "enemy" ], "readwrite").objectStore("enemy").openCursor().onsuccess = function(event) {
                        event = event.target.result;
                        event ? (event.value.data && (es[event.value.id] = new Enemy(event.value.data)), 
                        event.continue()) : (resolve(es), db.close());
                    };
                } else getAllEnemies().then(es => {
                    var tx = db.transaction([ "enemy" ], "readwrite"), store = tx.objectStore("enemy");
                    for (let i = 0; i < es.length; ++i) store.put({
                        id: i,
                        data: es[i]
                    });
                    tx.oncomplete = function() {
                        resolve(es), db.close();
                    };
                });
            };
        };
    });
}

async function loadAllCats() {
    return new Promise(resolve => {
        var req = indexedDB.open("db", C_VER);
        req.onupgradeneeded = onupgradeneeded, req.onsuccess = function(event) {
            const db = event.target.result;
            db.transaction([ "cats" ], "readwrite").objectStore("cats").get(717).onsuccess = function(event) {
                if (event.target.result) {
                    let cats = new Array({{{num-cats}}});
                    db.transaction([ "cats" ], "readwrite").objectStore("cats").openCursor().onsuccess = function(event) {
                        var c, event = event.target.result;
                        event ? ((c = new Cat(event.value.data)).init(), cats[event.value.id] = c, 
                        event.continue()) : (resolve(cats), db.close());
                    };
                } else getAllCats().then(cats => {
                    var c, tx = db.transaction([ "cats" ], "readwrite"), store = tx.objectStore("cats");
                    for (let i = 0; i < cats.length; ++i) store.put({
                        id: i,
                        data: cats[i].getObj()
                    });
                    for (c of cats) c.init();
                    tx.oncomplete = function() {
                        resolve(cats), db.close();
                    };
                });
            };
        };
    });
}

function createImuIcons(imu, parent) {
  const names = [ "波動傷害", "使動作停止", "使動作變慢", "打飛敵人", "烈波傷害", "攻擊力下降", "傳送", "古代的詛咒", "毒擊傷害", "魔王震波"];
  const icon_names = [ "MacWKW6", "OSjMN62", "rPx4aA2", "5CYatS4", "Uadt9Fa", "aN6I67V", "T7BXYAw", "27mAxhl", "5zleNqO", "4uYsoCg" ];
  if (imu) {
    var e;
    let i = 0;
    let c = 0;
    for (let x = 1; x <= 512; x <<= 1, ++i) {
      if (imu & x) {
        if (++c == 2) {
          const p = document.createElement('div');
          parent.removeChild(parent.lastElementChild);
          const texts = [];
          for (x = 1, i = 0; x <= 512; x <<= 1, ++i) {
            if (imu & x) {
              e = new Image(40, 40);
              e.src = 'https://i.imgur.com/' + icon_names[i]  + '.png';
              p.appendChild(e);
              texts.push(names[i]);
            }
          }
          p.append('無效（' + texts.join('、') + '）');
          parent.appendChild(p);
          return;
        }
        const p = document.createElement('div');
        e = new Image(40, 40);
        e.src = 'https://i.imgur.com/' + icon_names[i]  + '.png';
        p.appendChild(e);
        p.append(names[i] + '無效');
        parent.appendChild(p);
    }
    }
  }
}

function getAbiString(abi) {
    var strs;
    return abi ? (strs = [], 4 & abi && strs.push('一'), 2 & abi && strs.push('二'), 
    1 & abi && strs.push('三'), "，第" + strs.join(' / ') + "擊附加特性") : "";
}

const treasures = [ 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 30, 10, 30, 30, 30, 30, 30, 30, 30, 100, 600, 1500, 300, 100, 30, 300, 300, 300, 300, 100 ];

for (let i = 0; i < 31; ++i) {
    const x = localStorage.getItem("t$" + i.toString());
    null != x && (treasures[i] = parseInt(x));
}

const atk_t = 300 == treasures[0] ? 2.5 : 1 + .005 * treasures[0], hp_t = 300 == treasures[1] ? 2.5 : 1 + .005 * treasures[1];

function getRes(cd) {
    return Math.max(60, cd - 6 * (treasures[17] - 1) - .3 * treasures[2]);
}
