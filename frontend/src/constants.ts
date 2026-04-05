import type { AnalysisConfig } from "./types/game";

/**
 * The size of the board
 */
export const BOARD_SIZE = 19;

/**
 * All the 19 letters in the GTP coords system (exclude 'i')
 */
export const GTPLetters = "ABCDEFGHJKLMNOPQRST";

/**
 * A sample SGF file content
 */
export const SGFSample =
    "(;GK[2]TP[0]EV[rank game]CDT[30]TML[600]TM[600-30-3]RC[0]WCC[2]CDN[3]BID[???T??��?0]CNT[248]RU[korean]RE[W+R]DT[2025-08-10-15-09-18]KM[6.5]EVF[0]PCF[0]WID[Username]WR[22]WAVA[629]PW[Player_1]BCC[2]BR[22]PB[Player_2]BAVA[60004]GTM[2025:08:10:15:09]AP[New Tygem]SZ[19];B[pd];W[pp];B[cd];W[dp];B[qf];W[ed];B[hc];W[df];B[cf];W[cg];B[bg];W[ch];B[bf];W[de];B[bh];W[ci];B[he];W[ce];B[be];W[cc];B[bc];W[dc];B[bb];W[gh];B[ck];W[bi];B[cn];W[co];B[dn];W[fq];B[fo];W[ob];B[nc];W[nb];B[mc];W[qc];B[pc];W[pb];B[qd];W[rc];B[gq];W[fp];B[gp];W[gr];B[hr];W[fr];B[go];W[bo];B[nq];W[qn];B[pr];W[qq];B[qr];W[qk])";

/**
 * The URL to the analyze endpoint
 */
export const getAnalysisURL = "/api/analyze/";

/**
 * The URL to the get game data endpoint
 */
export const getGameDataURL = "/api/get-game-data/";

export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
    general: {
        algorithm: "nn",
        rules: "japanese",
        komi: 6.5,
        max_time_ms: 0, // 0 means no time limit
        temperature: 0,
        seed: 0,
    },
    neural_network: {
        model: "checkpoint_19x19",
        policy_softmax_temperature: 0.2,
        use_value_head: true, // whether to return the win rate or not
    },
    mcts: {
        num_simulations: 500,
        c_puct: 1.5,
        dirichlet_alpha: 0.3,
        dirichlet_epsilon: 0.25,
        value_weight: 1.0,
        policy_weight: 1.0,
        select_by: "visit_count",
    },
    minimax: {
        depth: 3,
        use_alpha_beta: true,
    },
    output: {
        include_top_moves: 5,
        include_policy: false,
        include_win_rate: false,
    },
};

/**
 * The width of the drawer
 */
export const drawerWidth = 250;
