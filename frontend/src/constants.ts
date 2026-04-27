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
    "(;GM[1]FF[4]SZ[19]PB[black]KM[7.5]PW[ianxie]RU[Chinese]RE[W+R];B[pd];W[pp];B[cd];W[dp];B[ec];W[qf];B[qh];W[qc];B[pc];W[qd];B[pe];W[rf];B[og];W[fd];B[ic];W[fc];B[eb];W[ed];B[dd];W[fg];B[dg];W[hg];B[if];W[ig];B[jf];W[jg];B[kf];W[cn];B[qn];W[nq];B[pk];W[ck];B[fh];W[gh];B[fi];W[eg];B[dh];W[gi];B[fj];W[gj];B[dj];W[lh];B[mg];W[fk];B[gk];W[fl];B[gl];W[gm];B[hm];W[gn];B[ik];W[im];B[hn];W[hl];B[hk];W[il];B[in];W[jk];B[km];W[ij];B[go];W[qo];B[pn];W[rn];B[rm];W[ro];B[cq];W[dq];B[dr];W[er];B[cr];W[cp];B[bp];W[bo];B[aq];W[ho];B[io];W[hp];B[ip];W[hq];B[iq];W[hr];B[lq];W[qb];B[pb];W[pa];B[oa];W[qa];B[nb];W[bi];B[bh];W[ci];B[ch];W[bs];B[br];W[ao];B[as];W[ap];B[cs];W[bq];B[qe];W[re];B[bp];W[rh];B[ri];W[qi];B[rj];W[ph];B[bq];W[fb];B[pr];W[or];B[qq];W[pq];B[rr];W[qs];B[ps];W[os];B[qr];W[rp];B[sq];W[rq];B[po];W[qp];B[op];W[np];B[oo];W[oq];B[mr];W[lp];B[kp];W[lo];B[jm];W[hj];B[ko];W[no];B[mm];W[di];B[eh];W[ej];B[nn];W[ln];B[lm];W[sp];B[ss];W[mq];B[lr];W[sn];B[lj];W[mh];B[nj];W[lg];B[mf];W[lf];B[le];W[ah];B[ag];W[ai];B[bf];W[ea];B[db];W[hb];B[ib];W[hc];B[hd];W[hf];B[he];W[pf];B[of];W[ir];B[jr];W[da];B[ca];W[fa];B[cb];W[ia];B[ja];W[ha];B[jb];W[rl];B[ql];W[sm];B[qm];W[rk];B[qk];W[qj];B[fr];W[es];B[fq];W[eq];B[is];W[hs];B[js];W[kj];B[li];W[ki];B[gf];W[ff];B[ge];W[gg];B[df];W[fe];B[pi];W[qg];B[pj];W[qh];B[oh];W[lk];B[mk];W[ni];B[ll];W[kk];B[mj];W[kg])";

/**
 * A sample parsed SGF game data object
 */
export const SGF_SAMPLE_GAME_DATA = {
    moves: [
        ["b", [15, 15]],
        ["w", [3, 15]],
        ["b", [15, 2]],
        ["w", [3, 3]],
        ["b", [16, 4]],
        ["w", [13, 16]],
        ["b", [11, 16]],
        ["w", [16, 16]],
        ["b", [16, 15]],
        ["w", [15, 16]],
        ["b", [14, 15]],
        ["w", [13, 17]],
        ["b", [12, 14]],
        ["w", [15, 5]],
        ["b", [16, 8]],
        ["w", [16, 5]],
        ["b", [17, 4]],
        ["w", [15, 4]],
        ["b", [15, 3]],
        ["w", [12, 5]],
        ["b", [12, 3]],
        ["w", [12, 7]],
        ["b", [13, 8]],
        ["w", [12, 8]],
        ["b", [13, 9]],
        ["w", [12, 9]],
        ["b", [13, 10]],
        ["w", [5, 2]],
        ["b", [5, 16]],
        ["w", [2, 13]],
        ["b", [8, 15]],
        ["w", [8, 2]],
        ["b", [11, 5]],
        ["w", [11, 6]],
        ["b", [10, 5]],
        ["w", [12, 4]],
        ["b", [11, 3]],
        ["w", [10, 6]],
        ["b", [9, 5]],
        ["w", [9, 6]],
        ["b", [9, 3]],
        ["w", [11, 11]],
        ["b", [12, 12]],
        ["w", [8, 5]],
        ["b", [8, 6]],
        ["w", [7, 5]],
        ["b", [7, 6]],
        ["w", [6, 6]],
        ["b", [6, 7]],
        ["w", [5, 6]],
        ["b", [8, 8]],
        ["w", [6, 8]],
        ["b", [5, 7]],
        ["w", [7, 7]],
        ["b", [8, 7]],
        ["w", [7, 8]],
        ["b", [5, 8]],
        ["w", [8, 9]],
        ["b", [6, 10]],
        ["w", [9, 8]],
        ["b", [4, 6]],
        ["w", [4, 16]],
        ["b", [5, 15]],
        ["w", [5, 17]],
        ["b", [6, 17]],
        ["w", [4, 17]],
        ["b", [2, 2]],
        ["w", [2, 3]],
        ["b", [1, 3]],
        ["w", [1, 4]],
        ["b", [1, 2]],
        ["w", [3, 2]],
        ["b", [3, 1]],
        ["w", [4, 1]],
        ["b", [2, 0]],
        ["w", [4, 7]],
        ["b", [4, 8]],
        ["w", [3, 7]],
        ["b", [3, 8]],
        ["w", [2, 7]],
        ["b", [2, 8]],
        ["w", [1, 7]],
        ["b", [2, 11]],
        ["w", [17, 16]],
        ["b", [17, 15]],
        ["w", [18, 15]],
        ["b", [18, 14]],
        ["w", [18, 16]],
        ["b", [17, 13]],
        ["w", [10, 1]],
        ["b", [11, 1]],
        ["w", [10, 2]],
        ["b", [11, 2]],
        ["w", [0, 1]],
        ["b", [1, 1]],
        ["w", [4, 0]],
        ["b", [0, 0]],
        ["w", [3, 0]],
        ["b", [0, 2]],
        ["w", [2, 1]],
        ["b", [14, 16]],
        ["w", [14, 17]],
        ["b", [3, 1]],
        ["w", [11, 17]],
        ["b", [10, 17]],
        ["w", [10, 16]],
        ["b", [9, 17]],
        ["w", [11, 15]],
        ["b", [2, 1]],
        ["w", [17, 5]],
        ["b", [1, 15]],
        ["w", [1, 14]],
        ["b", [2, 16]],
        ["w", [2, 15]],
        ["b", [1, 17]],
        ["w", [0, 16]],
        ["b", [0, 15]],
        ["w", [0, 14]],
        ["b", [1, 16]],
        ["w", [3, 17]],
        ["b", [2, 18]],
        ["w", [2, 17]],
        ["b", [4, 15]],
        ["w", [3, 16]],
        ["b", [3, 14]],
        ["w", [3, 13]],
        ["b", [4, 14]],
        ["w", [2, 14]],
        ["b", [1, 12]],
        ["w", [3, 11]],
        ["b", [3, 10]],
        ["w", [4, 11]],
        ["b", [6, 9]],
        ["w", [9, 7]],
        ["b", [4, 10]],
        ["w", [4, 13]],
        ["b", [6, 12]],
        ["w", [10, 3]],
        ["b", [11, 4]],
        ["w", [9, 4]],
        ["b", [5, 13]],
        ["w", [5, 11]],
        ["b", [6, 11]],
        ["w", [3, 18]],
        ["b", [0, 18]],
        ["w", [2, 12]],
        ["b", [1, 11]],
        ["w", [5, 18]],
        ["b", [9, 11]],
        ["w", [11, 12]],
        ["b", [9, 13]],
        ["w", [12, 11]],
        ["b", [13, 12]],
        ["w", [13, 11]],
        ["b", [14, 11]],
        ["w", [11, 0]],
        ["b", [12, 0]],
        ["w", [10, 0]],
        ["b", [13, 1]],
        ["w", [18, 4]],
        ["b", [17, 3]],
        ["w", [17, 7]],
        ["b", [17, 8]],
        ["w", [16, 7]],
        ["b", [15, 7]],
        ["w", [13, 7]],
        ["b", [14, 7]],
        ["w", [13, 15]],
        ["b", [13, 14]],
        ["w", [1, 8]],
        ["b", [1, 9]],
        ["w", [18, 3]],
        ["b", [18, 2]],
        ["w", [18, 5]],
        ["b", [17, 2]],
        ["w", [18, 8]],
        ["b", [18, 9]],
        ["w", [18, 7]],
        ["b", [17, 9]],
        ["w", [7, 17]],
        ["b", [7, 16]],
        ["w", [6, 18]],
        ["b", [6, 16]],
        ["w", [8, 17]],
        ["b", [8, 16]],
        ["w", [9, 16]],
        ["b", [1, 5]],
        ["w", [0, 4]],
        ["b", [2, 5]],
        ["w", [2, 4]],
        ["b", [0, 8]],
        ["w", [0, 7]],
        ["b", [0, 9]],
        ["w", [9, 10]],
        ["b", [10, 11]],
        ["w", [10, 10]],
        ["b", [13, 6]],
        ["w", [13, 5]],
        ["b", [14, 6]],
        ["w", [12, 6]],
        ["b", [13, 3]],
        ["w", [14, 5]],
        ["b", [10, 15]],
        ["w", [12, 16]],
        ["b", [9, 15]],
        ["w", [11, 16]],
        ["b", [11, 14]],
        ["w", [8, 11]],
        ["b", [8, 12]],
        ["w", [10, 13]],
        ["b", [7, 11]],
        ["w", [8, 10]],
        ["b", [9, 12]],
        ["w", [12, 10]],
    ],
    size: 19,
    komi: 7.5,
    players: {
        black: "black",
        white: "ianxie",
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
