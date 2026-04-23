import type { AnalysisConfig, MoveCoords } from "./types/game";

/**
 * The size of the board
 */
export const BOARD_SIZE = 19;

/**
 * All the 19 letters in the GTP coords system (exclude 'i')
 */
export const GTP_LETTERS = "ABCDEFGHJKLMNOPQRST";

/**
 * The row and column of a pass move
 */
export const PASS_MOVE_ROW_COL: MoveCoords = [-1, -1];

/**
 * The amount of moves to fast forward by
 */
export const FAST_FORWARD_AMOUNT = 5;

/**
 * A sample SGF file content
 */
export const SGF_SAMPLE =
    "(;GM[1]FF[4]SZ[19]PB[black]KM[7.5]PW[ianxie]RU[Chinese]RE[W+R];B[pd];W[pp];B[cd];W[dp];B[ec];W[qf];B[qh];W[qc];B[pc];W[qd];B[pe];W[rf];B[og];W[fd];B[ic];W[fc];B[eb];W[ed];B[dd];W[fg];B[dg];W[hg];B[if];W[ig];B[jf];W[jg];B[kf];W[cn];B[qn];W[nq];B[pk];W[ck];B[fh];W[gh];B[fi];W[eg];B[dh];W[gi];B[fj];W[gj];B[dj];W[lh];B[mg];W[fk];B[gk];W[fl];B[gl];W[gm];B[hm];W[gn];B[ik];W[im];B[hn];W[hl];B[hk];W[il];B[in];W[jk];B[km];W[ij];B[go];W[qo];B[pn];W[rn];B[rm];W[ro];B[cq];W[dq];B[dr];W[er];B[cr];W[cp];B[bp];W[bo];B[aq];W[ho];B[io];W[hp];B[ip];W[hq];B[iq];W[hr];B[lq];W[qb];B[pb];W[pa];B[oa];W[qa];B[nb];W[bi];B[bh];W[ci];B[ch];W[bs];B[br];W[ao];B[as];W[ap];B[cs];W[bq];B[qe];W[re];B[bp];W[rh];B[ri];W[qi];B[rj];W[ph];B[bq];W[fb];B[pr];W[or];B[qq];W[pq];B[rr];W[qs];B[ps];W[os];B[qr];W[rp];B[sq];W[rq];B[po];W[qp];B[op];W[np];B[oo];W[oq];B[mr];W[lp];B[kp];W[lo];B[jm];W[hj];B[ko];W[no];B[mm];W[di];B[eh];W[ej];B[nn];W[ln];B[lm];W[sp];B[ss];W[mq];B[lr];W[sn];B[lj];W[mh];B[nj];W[lg];B[mf];W[lf];B[le];W[ah];B[ag];W[ai];B[bf];W[ea];B[db];W[hb];B[ib];W[hc];B[hd];W[hf];B[he];W[pf];B[of];W[ir];B[jr];W[da];B[ca];W[fa];B[cb];W[ia];B[ja];W[ha];B[jb];W[rl];B[ql];W[sm];B[qm];W[rk];B[qk];W[qj];B[fr];W[es];B[fq];W[eq];B[is];W[hs];B[js];W[kj];B[li];W[ki];B[gf];W[ff];B[ge];W[gg];B[df];W[fe];B[pi];W[qg];B[pj];W[qh];B[oh];W[lk];B[mk];W[ni];B[ll];W[kk];B[mj];W[kg])";

/**
 * The URL to the analyze endpoint
 */
export const GET_ANALYSIS_URL = "/api/analyze/";

/**
 * The URL to the get game data endpoint
 */
export const GET_GAME_DATA_URL = "/api/get-game-data/";

/**
 * The URL to the games endpoint
 */
export const GAMES_URL = "/api/games/";

/**
 * The regex to validate an email
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The default analysis config
 */
export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
    general: {
        algorithm: "nn",
        rules: "japanese",
        komi: 6.5,
        max_time_ms: 0, // 0 means no time limit
        temperature: 0,
        seed: "",
    },
    nn: {
        model: "checkpoint_19x19",
        policy_softmax_temperature: 0.2,
    },
    mcts: {
        num_simulations: 500,
        c_puct: 1.5,
        dirichlet_alpha: 0.03,
        dirichlet_epsilon: 0.25,
        value_weight: 1.0,
        policy_weight: 1.0,
        select_by: "visit_count",
    },
    minimax: {
        depth: 2,
        use_alpha_beta: true,
    },
    output: {
        include_top_moves: 5,
        include_policy: true,
        include_winrate: true,
        include_visits: true,
    },
};

/**
 * The fields in general that needs to be merged into the analysis params
 */
export const FIELDS_TO_MERGE = ["seed", "max_time_ms", "temperature"];

/**
 * The width of the drawer
 */
export const DRAWER_WIDTH = 250;
