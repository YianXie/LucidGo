import type { AnalysisConfig, MoveCoords, UserSettings } from "./types/game";

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
    "(;PB[KeJie]BR[9 Dan]PW[AlphaGo]KM[7.5]SZ[19]RE[W+0.5];B[qd];W[pp];B[cc];W[cp];B[nc];W[fp];B[qq];W[pq];B[qp];W[qn];B[qo];W[po];B[rn];W[qr];B[rr];W[rm];B[pr];W[or];B[pn];W[qm];B[qs];W[on];B[dj];W[nk];B[ph];W[ch];B[cf];W[eh];B[ci];W[de];B[df];W[dc];B[cd];W[dd];B[ef];W[di];B[ei];W[dh];B[cj];W[ce];B[be];W[bf];B[bg];W[bd];B[af];W[bc];B[fi];W[cm];B[hq];W[ek];B[fh];W[gq];B[hp];W[ej];B[eq];W[gr];B[cq];W[dp];B[dq];W[ep];B[bp];W[bh];B[ah];W[bo];B[bq];W[fg];B[gg];W[kp];B[ko];W[jo];B[jn];W[in];B[jp];W[io];B[lp];W[kq];B[lq];W[kr];B[lr];W[ir];B[kn];W[il];B[oq];W[pf];B[nh];W[rf];B[od];W[qi];B[qg];W[rd];B[qf];W[qe];B[pe];W[re];B[qc];W[rg];B[kh];W[ic];B[gc];W[kc];B[jd];W[id];B[ge];W[hb];B[gb];W[jf];B[je];W[ie];B[ld];W[hg];B[eg];W[lc];B[le];W[hf];B[qh];W[rh];B[pi];W[qj];B[gk];W[fd];B[gd];W[lf];B[mf];W[lg];B[gm];W[gn];B[fn];W[go];B[dl];W[mo];B[oo];W[pm];B[op];W[mg];B[nf];W[lo];B[nn];W[lm];B[pn];W[dk];B[ck];W[cl];B[el];W[bk];B[bi];W[li];B[ii];W[ds];B[dr];W[hi];B[ik];W[jk];B[ij];W[md];B[mc];W[ke];B[me];W[kd];B[om];W[ls];B[ms];W[ks];B[nr];W[ng];B[og];W[es];B[cs];W[fr];B[er];W[fs];B[bs];W[hl];B[pl];W[ql];B[rc];W[ro];B[rp];W[sn];B[hm];W[im];B[kk];W[kj];B[lk];W[jl];B[mj];W[mi];B[nj];W[pk];B[fm];W[cn];B[ol];W[ok];B[ni];W[ih];B[ji];W[mb];B[nb];W[lb];B[fe];W[cb];B[mp];W[mm];B[eb];W[na];B[oa];W[ma];B[qb];W[bj];B[ai];W[aj];B[ag];W[gl];B[fk];W[bl];B[kg];W[kf];B[ib];W[jb];B[ga];W[ha];B[ed];W[ec];B[fc];W[gf];B[ff];W[gj];B[hk];W[hh];B[fj];W[no];B[fq];W[hr];B[kl];W[km];B[mn];W[ln];B[nl];W[db];B[da];W[ca];B[ea];W[np];B[nq];W[oj];B[oi];W[en];B[em];W[eo];B[dm];W[dn];B[sp];W[so];B[hn];W[ho];B[hc];W[ia];B[ao];W[an];B[ap];W[sc];B[sb];W[sd];B[jg];W[ad];B[gh];W[ae];B[ee];W[ml];B[mk];W[pj];B[bf];W[nm];B[on];W[he];B[ig];W[ki];B[jh];W[fl];B[jj];W[fo];B[hj];W[gi];B[ll];W[jm];B[lh];W[mh];B[lj];W[if];B[hd])";

/**
 * A sample parsed SGF game data object
 */
export const SGF_SAMPLE_GAME_DATA = {
    moves: [
        ["b", [15, 16]],
        ["w", [3, 15]],
        ["b", [16, 2]],
        ["w", [3, 2]],
        ["b", [16, 13]],
        ["w", [3, 5]],
        ["b", [2, 16]],
        ["w", [2, 15]],
        ["b", [3, 16]],
        ["w", [5, 16]],
        ["b", [4, 16]],
        ["w", [4, 15]],
        ["b", [5, 17]],
        ["w", [1, 16]],
        ["b", [1, 17]],
        ["w", [6, 17]],
        ["b", [1, 15]],
        ["w", [1, 14]],
        ["b", [5, 15]],
        ["w", [6, 16]],
        ["b", [0, 16]],
        ["w", [5, 14]],
        ["b", [9, 3]],
        ["w", [8, 13]],
        ["b", [11, 15]],
        ["w", [11, 2]],
        ["b", [13, 2]],
        ["w", [11, 4]],
        ["b", [10, 2]],
        ["w", [14, 3]],
        ["b", [13, 3]],
        ["w", [16, 3]],
        ["b", [15, 2]],
        ["w", [15, 3]],
        ["b", [13, 4]],
        ["w", [10, 3]],
        ["b", [10, 4]],
        ["w", [11, 3]],
        ["b", [9, 2]],
        ["w", [14, 2]],
        ["b", [14, 1]],
        ["w", [13, 1]],
        ["b", [12, 1]],
        ["w", [15, 1]],
        ["b", [13, 0]],
        ["w", [16, 1]],
        ["b", [10, 5]],
        ["w", [6, 2]],
        ["b", [2, 7]],
        ["w", [8, 4]],
        ["b", [11, 5]],
        ["w", [2, 6]],
        ["b", [3, 7]],
        ["w", [9, 4]],
        ["b", [2, 4]],
        ["w", [1, 6]],
        ["b", [2, 2]],
        ["w", [3, 3]],
        ["b", [2, 3]],
        ["w", [3, 4]],
        ["b", [3, 1]],
        ["w", [11, 1]],
        ["b", [11, 0]],
        ["w", [4, 1]],
        ["b", [2, 1]],
        ["w", [12, 5]],
        ["b", [12, 6]],
        ["w", [3, 10]],
        ["b", [4, 10]],
        ["w", [4, 9]],
        ["b", [5, 9]],
        ["w", [5, 8]],
        ["b", [3, 9]],
        ["w", [4, 8]],
        ["b", [3, 11]],
        ["w", [2, 10]],
        ["b", [2, 11]],
        ["w", [1, 10]],
        ["b", [1, 11]],
        ["w", [1, 8]],
        ["b", [5, 10]],
        ["w", [7, 8]],
        ["b", [2, 14]],
        ["w", [13, 15]],
        ["b", [11, 13]],
        ["w", [13, 17]],
        ["b", [15, 14]],
        ["w", [10, 16]],
        ["b", [12, 16]],
        ["w", [15, 17]],
        ["b", [13, 16]],
        ["w", [14, 16]],
        ["b", [14, 15]],
        ["w", [14, 17]],
        ["b", [16, 16]],
        ["w", [12, 17]],
        ["b", [11, 10]],
        ["w", [16, 8]],
        ["b", [16, 6]],
        ["w", [16, 10]],
        ["b", [15, 9]],
        ["w", [15, 8]],
        ["b", [14, 6]],
        ["w", [17, 7]],
        ["b", [17, 6]],
        ["w", [13, 9]],
        ["b", [14, 9]],
        ["w", [14, 8]],
        ["b", [15, 11]],
        ["w", [12, 7]],
        ["b", [12, 4]],
        ["w", [16, 11]],
        ["b", [14, 11]],
        ["w", [13, 7]],
        ["b", [11, 16]],
        ["w", [11, 17]],
        ["b", [10, 15]],
        ["w", [9, 16]],
        ["b", [8, 6]],
        ["w", [15, 5]],
        ["b", [15, 6]],
        ["w", [13, 11]],
        ["b", [13, 12]],
        ["w", [12, 11]],
        ["b", [6, 6]],
        ["w", [5, 6]],
        ["b", [5, 5]],
        ["w", [4, 6]],
        ["b", [7, 3]],
        ["w", [4, 12]],
        ["b", [4, 14]],
        ["w", [6, 15]],
        ["b", [3, 14]],
        ["w", [12, 12]],
        ["b", [13, 13]],
        ["w", [4, 11]],
        ["b", [5, 13]],
        ["w", [6, 11]],
        ["b", [5, 15]],
        ["w", [8, 3]],
        ["b", [8, 2]],
        ["w", [7, 2]],
        ["b", [7, 4]],
        ["w", [8, 1]],
        ["b", [10, 1]],
        ["w", [10, 11]],
        ["b", [10, 8]],
        ["w", [0, 3]],
        ["b", [1, 3]],
        ["w", [10, 7]],
        ["b", [8, 8]],
        ["w", [8, 9]],
        ["b", [9, 8]],
        ["w", [15, 12]],
        ["b", [16, 12]],
        ["w", [14, 10]],
        ["b", [14, 12]],
        ["w", [15, 10]],
        ["b", [6, 14]],
        ["w", [0, 11]],
        ["b", [0, 12]],
        ["w", [0, 10]],
        ["b", [1, 13]],
        ["w", [12, 13]],
        ["b", [12, 14]],
        ["w", [0, 4]],
        ["b", [0, 2]],
        ["w", [1, 5]],
        ["b", [1, 4]],
        ["w", [0, 5]],
        ["b", [0, 1]],
        ["w", [7, 7]],
        ["b", [7, 15]],
        ["w", [7, 16]],
        ["b", [16, 17]],
        ["w", [4, 17]],
        ["b", [3, 17]],
        ["w", [5, 18]],
        ["b", [6, 7]],
        ["w", [6, 8]],
        ["b", [8, 10]],
        ["w", [9, 10]],
        ["b", [8, 11]],
        ["w", [7, 9]],
        ["b", [9, 12]],
        ["w", [10, 12]],
        ["b", [9, 13]],
        ["w", [8, 15]],
        ["b", [6, 5]],
        ["w", [5, 2]],
        ["b", [7, 14]],
        ["w", [8, 14]],
        ["b", [10, 13]],
        ["w", [11, 8]],
        ["b", [10, 9]],
        ["w", [17, 12]],
        ["b", [17, 13]],
        ["w", [17, 11]],
        ["b", [14, 5]],
        ["w", [17, 2]],
        ["b", [3, 12]],
        ["w", [6, 12]],
        ["b", [17, 4]],
        ["w", [18, 13]],
        ["b", [18, 14]],
        ["w", [18, 12]],
        ["b", [17, 16]],
        ["w", [9, 1]],
        ["b", [10, 0]],
        ["w", [9, 0]],
        ["b", [12, 0]],
        ["w", [7, 6]],
        ["b", [8, 5]],
        ["w", [7, 1]],
        ["b", [12, 10]],
        ["w", [13, 10]],
        ["b", [17, 8]],
        ["w", [17, 9]],
        ["b", [18, 6]],
        ["w", [18, 7]],
        ["b", [15, 4]],
        ["w", [16, 4]],
        ["b", [16, 5]],
        ["w", [13, 6]],
        ["b", [13, 5]],
        ["w", [9, 6]],
        ["b", [8, 7]],
        ["w", [11, 7]],
        ["b", [9, 5]],
        ["w", [4, 13]],
        ["b", [2, 5]],
        ["w", [1, 7]],
        ["b", [7, 10]],
        ["w", [6, 10]],
        ["b", [5, 12]],
        ["w", [5, 11]],
        ["b", [7, 13]],
        ["w", [17, 3]],
        ["b", [18, 3]],
        ["w", [18, 2]],
        ["b", [18, 4]],
        ["w", [3, 13]],
        ["b", [2, 13]],
        ["w", [9, 14]],
        ["b", [10, 14]],
        ["w", [5, 4]],
        ["b", [6, 4]],
        ["w", [4, 4]],
        ["b", [6, 3]],
        ["w", [5, 3]],
        ["b", [3, 18]],
        ["w", [4, 18]],
        ["b", [5, 7]],
        ["w", [4, 7]],
        ["b", [16, 7]],
        ["w", [18, 8]],
        ["b", [4, 0]],
        ["w", [5, 0]],
        ["b", [3, 0]],
        ["w", [16, 18]],
        ["b", [17, 18]],
        ["w", [15, 18]],
        ["b", [12, 9]],
        ["w", [15, 0]],
        ["b", [11, 6]],
        ["w", [14, 0]],
        ["b", [14, 4]],
        ["w", [7, 12]],
        ["b", [8, 12]],
        ["w", [9, 15]],
        ["b", [13, 1]],
        ["w", [6, 13]],
        ["b", [5, 14]],
        ["w", [14, 7]],
        ["b", [12, 8]],
        ["w", [10, 10]],
        ["b", [11, 9]],
        ["w", [7, 5]],
        ["b", [9, 9]],
        ["w", [4, 5]],
        ["b", [9, 7]],
        ["w", [10, 6]],
        ["b", [7, 11]],
        ["w", [6, 9]],
        ["b", [11, 11]],
        ["w", [11, 12]],
        ["b", [9, 11]],
        ["w", [13, 8]],
        ["b", [15, 7]],
    ],
    size: 19,
    komi: 7.5,
    players: {
        black: "KeJie",
        white: "AlphaGo",
    },
    winner: "w",
};

/**
 * The URL to the post analysis request
 */
export const POST_ANALYSIS_URL = "/api/analyze/";

/**
 * The URL to post the winrate of a game
 */
export const POST_WINRATE_URL = "/api/winrate/";

/**
 * The URL to the get game data endpoint
 */
export const GET_GAME_DATA_URL = "/api/get-game-data/";

/**
 * The URL to get/put the games
 */
export const GAMES_URL = "/api/games/";

/**
 * The URL to get/put user settings
 */
export const USER_SETTINGS_URL = "/auth/user/settings/";

/**
 * The regex to validate an email
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The default analysis config
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
    general_settings: {
        auto_save_games: false,
    },
    analysis_config: {
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

/**
 * Right-hand analysis column (move controls, win rate, settings) on md+.
 * Tuned so the control icon row does not need to wrap on typical desktop layouts.
 */
export const ANALYSIS_RIGHT_PANEL_WIDTH: Record<string, string | number> = {
    xs: "100%",
    md: 408,
    lg: 432,
    xl: 456,
};
