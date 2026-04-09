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
 * A sample SGF file content
 */
export const SGF_SAMPLE =
    "(;RU[korean]RE[W+R]KM[6.5]PW[Player_1]PB[Player_2]SZ[19];B[pd];W[pp];B[cd];W[dp];B[qf];W[ed];B[hc];W[df];B[cf];W[cg];B[bg];W[ch];B[bf];W[de];B[bh];W[ci];B[he];W[ce];B[be];W[cc];B[bc];W[dc];B[bb];W[gh];B[ck];W[bi];B[cn];W[co];B[dn];W[fq];B[fo];W[ob];B[nc];W[nb];B[mc];W[qc];B[pc];W[pb];B[qd];W[rc];B[gq];W[fp];B[gp];W[gr];B[hr];W[fr];B[go];W[bo];B[nq];W[qn];B[pr];W[qq];B[qr];W[qk])";

/**
 * The URL to the analyze endpoint
 */
export const GET_ANALYSIS_URL = "/api/analyze/";

/**
 * The URL to the get game data endpoint
 */
export const GET_GAME_DATA_URL = "/api/get-game-data/";

export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
    general: {
        algorithm: "nn",
        rules: "japanese",
        komi: 6.5,
        max_time_ms: 0, // 0 means no time limit
        temperature: 0,
        seed: 0,
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
